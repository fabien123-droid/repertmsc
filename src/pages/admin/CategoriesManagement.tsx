import { AdminCategories } from "@/components/admin/AdminCategories";

export default function CategoriesManagement() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Gestion des catégories</h1>
        <p className="text-muted-foreground mt-1">
          Organisez vos chants par catégories
        </p>
      </div>
      <AdminCategories />
    </div>
  );
}
