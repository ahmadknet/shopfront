import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ProductInput } from "../api";

type Draft = { name: string; description: string; price: string; stock: string };
const empty: Draft = { name: "", description: "", price: "", stock: "0" };

function validate(d: Draft): Partial<Record<keyof Draft, string>> {
  const errors: Partial<Record<keyof Draft, string>> = {};
  if (!d.name.trim()) errors.name = "Enter a product name.";
  if (!(Number(d.price) > 0)) errors.price = "Enter a price above 0.";
  if (!Number.isInteger(Number(d.stock)) || Number(d.stock) < 0) errors.stock = "Enter a whole number, 0 or more.";
  return errors;
}

export default function ProductForm() {
  const { id } = useParams();
  const editingId = id ? Number(id) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const existing = useQuery({
    queryKey: ["product", editingId],
    queryFn: () => api.getProduct(editingId!),
    enabled: editingId !== null,
  });

  const [draft, setDraft] = useState<Draft>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});

  useEffect(() => {
    if (existing.data) {
      const p = existing.data;
      setDraft({ name: p.name, description: p.description, price: String(p.price), stock: String(p.stock) });
    }
  }, [existing.data]);

  const save = useMutation({
    mutationFn: (input: ProductInput) =>
      editingId === null ? api.createProduct(input) : api.updateProduct(editingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/");
    },
  });

  const set = (field: keyof Draft) => (e: { target: { value: string } }) =>
    setDraft((d) => ({ ...d, [field]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    save.mutate({
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: Number(draft.price),
      stock: Number(draft.stock),
    });
  }

  if (editingId !== null && existing.isLoading) return <p className="muted">Loading product…</p>;
  if (editingId !== null && existing.isError) return <p role="alert" className="error">{existing.error.message}</p>;

  return (
    <form className="panel narrow" onSubmit={submit} noValidate>
      <h1>{editingId === null ? "Add product" : "Edit product"}</h1>
      <label>Name
        <input value={draft.name} onChange={set("name")} aria-invalid={!!errors.name} />
        {errors.name && <span className="error">{errors.name}</span>}
      </label>
      <label>Description
        <textarea rows={3} value={draft.description} onChange={set("description")} />
      </label>
      <label>Price (INR)
        <input inputMode="decimal" value={draft.price} onChange={set("price")} aria-invalid={!!errors.price} />
        {errors.price && <span className="error">{errors.price}</span>}
      </label>
      <label>Stock
        <input inputMode="numeric" value={draft.stock} onChange={set("stock")} aria-invalid={!!errors.stock} />
        {errors.stock && <span className="error">{errors.stock}</span>}
      </label>
      {save.isError && <p role="alert" className="error">{save.error.message}</p>}
      <div className="row">
        <button type="submit" disabled={save.isPending}>Save product</button>
        <button type="button" className="link" onClick={() => navigate("/")}>Cancel</button>
      </div>
    </form>
  );
}
