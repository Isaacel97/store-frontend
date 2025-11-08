import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setValidSession(true);
  }, [router]);

  return <>{validSession ? children : null}</>;
}
