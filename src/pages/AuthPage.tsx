import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowLeft, Music } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou mot de passe incorrect");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Connexion réussie");
        navigate("/admin");
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Cet email est déjà utilisé");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Compte créé avec succès");
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="container py-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour à l'accueil</span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">Administration</h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Connectez-vous pour gérer le répertoire" : "Créez un compte administrateur"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 bg-card rounded-2xl border border-border p-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@chorale.fr"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isLogin ? (
                "Se connecter"
              ) : (
                "Créer le compte"
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-muted-foreground">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
