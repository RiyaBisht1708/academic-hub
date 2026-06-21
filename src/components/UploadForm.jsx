import { useRef, useState } from "react";
import { supabase, STORAGE_BUCKET } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { RESOURCE_STATUS } from "../lib/roles";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const CATEGORIES = ["Notes", "Question Paper", "Assignment", "Lab Manual", "Other"];
const UPLOAD_TIMEOUT_MS = 60000;

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function getUploadErrorMessage(err) {
  const message = err?.message || "";

  if (message.includes("Bucket not found") || message.includes("bucket")) {
    return "Storage bucket not set up. In Supabase, create a public bucket named 'resources' and run supabase/schema.sql.";
  }
  if (message.includes("row-level security") || message.includes("permission")) {
    return "Permission denied. Run supabase/schema.sql in the Supabase SQL Editor to set up RLS policies.";
  }
  if (message.includes("timed out")) {
    return "Upload timed out. Check your internet connection and try again.";
  }

  return message || "Upload failed. Please try again.";
}

export default function UploadForm({ onUploaded }) {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected && selected.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }
    setError("");
    setFile(selected);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !semester || !subject || !category || !file) {
      setError("All fields and a PDF file are required.");
      return;
    }

    setUploading(true);
    try {
      const safeSubject = subject.trim().replace(/[/\\]/g, "-");
      const safeName = file.name.replace(/[/\\]/g, "-");
      const filePath = `${semester}/${safeSubject}/${Date.now()}_${safeName}`;

      const uploadPromise = supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { contentType: "application/pdf", upsert: false });

      const { error: uploadError } = await withTimeout(
        uploadPromise,
        UPLOAD_TIMEOUT_MS,
        "Upload timed out after 60 seconds."
      );
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);
      const fileURL = urlData.publicUrl;

      const { error: insertError } = await supabase.from("resources").insert({
        title,
        semester: Number(semester),
        subject,
        category,
        file_url: fileURL,
        uploader: userProfile?.fullName || currentUser.email,
        uploader_id: currentUser.uid,
        status: RESOURCE_STATUS.PENDING,
      });
      if (insertError) throw insertError;

      try {
        await supabase.rpc("increment_upload_count", { user_id: currentUser.uid });
        await refreshProfile();
      } catch {
        // Upload already succeeded; don't block on profile counter updates.
      }

      setSuccess("Resource uploaded successfully! Awaiting admin approval.");
      setTitle("");
      setSemester("");
      setSubject("");
      setCategory("");
      setFile(null);
      formRef.current?.reset();
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (onUploaded) onUploaded();
    } catch (err) {
      setError(getUploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md mb-8"
    >
      <h3 className="text-xl font-bold mb-4 text-blue-700">Upload Resource</h3>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-3 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <input
          placeholder="Resource Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="Subject (e.g. Data Structures)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Semester</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>{`Semester ${s}`}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-700 text-white px-5 py-2 rounded font-medium hover:bg-blue-800 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>
    </form>
  );
}
