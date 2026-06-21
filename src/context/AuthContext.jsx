// Global auth state: current user, register, login, logout.
// Wraps the whole app so any component can call useAuth().
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function mapUser(user) {
  if (!user) return null;
  return { uid: user.id, email: user.email };
}

function mapProfile(row) {
  if (!row) return null;
  return {
    uid: row.id,
    fullName: row.full_name,
    email: row.email,
    branch: row.branch,
    semester: row.semester,
    role: row.role,
    uploadCount: row.upload_count,
    createdAt: row.created_at,
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserProfile(uid) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();

    if (error) return null;
    return mapProfile(data);
  }

  async function register({ email, password, fullName, branch, semester }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error("Registration failed. Please try again.");

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      email,
      branch,
      semester: Number(semester),
    });

    if (profileError) throw profileError;

    const profile = mapProfile({
      id: user.id,
      full_name: fullName,
      email,
      branch,
      semester: Number(semester),
      role: "Student",
      upload_count: 0,
    });

    setCurrentUser(mapUser(user));
    setUserProfile(profile);
    return mapUser(user);
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const user = data.user;
    const profile = await fetchUserProfile(user.id);
    setCurrentUser(mapUser(user));
    setUserProfile(profile);
    return mapUser(user);
  }

  async function logout() {
    setUserProfile(null);
    setCurrentUser(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function updateProfile({ fullName, branch, semester }) {
    if (!currentUser) throw new Error("Not authenticated.");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        branch,
        semester: Number(semester),
      })
      .eq("id", currentUser.uid);

    if (error) throw error;

    const profile = await fetchUserProfile(currentUser.uid);
    setUserProfile(profile);
    return profile;
  }

  async function refreshProfile() {
    if (!currentUser) return null;
    const profile = await fetchUserProfile(currentUser.uid);
    setUserProfile(profile);
    return profile;
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setCurrentUser(mapUser(user));
      if (user) {
        fetchUserProfile(user.id).then(setUserProfile);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(mapUser(user));
      if (user) {
        fetchUserProfile(user.id).then(setUserProfile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    currentUser,
    userProfile,
    register,
    login,
    logout,
    updateProfile,
    refreshProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
