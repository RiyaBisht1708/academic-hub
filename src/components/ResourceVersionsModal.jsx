import { useEffect, useState, useRef } from "react";
import { supabase, STORAGE_BUCKET } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";
import { mapVersion, formatDate } from "../lib/resourceUtils";
import { RESOURCE_STATUS } from "../lib/roles";
import { logActivity } from "../lib/activity";

export default function ResourceVersionsModal({ resource, onClose, onUpdated }) {
  const { currentUser, userProfile } = useAuth();
  const { isAdmin } = useRole();
  const fileInputRef = useRef(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canUploadVersion =
    (resource.uploaderId === currentUser?.uid || isAdmin) &&
    (resource.status === RESOURCE_STATUS.APPROVED ||
      resource.status === RESOURCE_STATUS.REJECTED);

  async function fetchVersions() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("resource_versions")
      .select("*")
      .eq("resource_id", resource.id)
      .order("version_number", { ascending: false });

    if (fetchError) setError(fetchError.message);
    else setVersions((data || []).map(mapVersion));
    setLoading(false);
  }

  useEffect(() => {
    fetchVersions();
  }, [resource.id]);

  async function handleNewVersion(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const nextVersion = (resource.currentVersion || versions[0]?.versionNumber || 0) + 1;
      const safeSubject = resource.subject.trim().replace(/[/\\]/g, "-");
      const safeName = file.name.replace(/[/\\]/g, "-");
      const filePath = `${resource.semester}/${safeSubject}/v${nextVersion}_${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { contentType: "application/pdf" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      const fileURL = urlData.publicUrl;
      const uploaderName = userProfile?.fullName || currentUser.email;

      const { error: versionError } = await supabase.from("resource_versions").insert({
        resource_id: resource.id,
        version_number: nextVersion,
        file_url: fileURL,
        uploader: uploaderName,
        uploader_id: currentUser.uid,
      });
      if (versionError) throw versionError;

      const { error: updateError } = await supabase
        .from("resources")
        .update({
          file_url: fileURL,
          current_version: nextVersion,
          status: RESOURCE_STATUS.PENDING,
          uploader: uploaderName,
        })
        .eq("id", resource.id);

      if (updateError) throw updateError;

      await logActivity("upload", resource.id, `${resource.title} (v${nextVersion})`);
      setSuccess(`Version ${nextVersion} uploaded. Awaiting admin approval.`);
      await fetchVersions();
      onUpdated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-slate-800">Version History</h3>
            <p className="text-sm text-slate-500 line-clamp-1">{resource.title}</p>
            <p className="text-xs text-slate-400 mt-1">
              Current: v{resource.currentVersion || 1}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg mb-3 text-sm">{success}</div>
          )}

          {canUploadVersion && (
            <div className="mb-6 pb-6 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-2">Upload new version</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                disabled={uploading}
                onChange={handleNewVersion}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
              {uploading && <p className="text-xs text-slate-500 mt-1">Uploading...</p>}
              <p className="text-xs text-slate-400 mt-1">
                New versions require admin re-approval.
              </p>
            </div>
          )}

          {loading && <p className="text-sm text-slate-500">Loading versions...</p>}

          {!loading && (
            <ul className="space-y-3">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      Version {version.versionNumber}
                      {version.versionNumber === resource.currentVersion && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {version.uploader} · {formatDate(version.createdAt)}
                    </p>
                  </div>
                  <a
                    href={version.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 shrink-0"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
