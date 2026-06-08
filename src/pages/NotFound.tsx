import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <div className="mb-6 flex justify-center">
          <img
            src="/mrlogo.png"
            alt="Machinery Ring Nyandarua"
            className="h-20 w-auto object-contain"
          />
        </div>

        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h1 className="mb-2 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-lg font-medium text-foreground">Page Not Found</p>

        <div className="mb-6 rounded-xl bg-muted p-4 text-left">
          <p className="text-sm font-medium text-muted-foreground">Attempted URL</p>
          <p className="mt-1 break-all font-mono text-sm text-foreground">
            {location.pathname}
          </p>
        </div>

        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
