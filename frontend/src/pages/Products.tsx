import { useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAuth } from "../auth";

const PAGE_SIZE = 10;
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function Products() {
  const { email } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["products", search, page],
    queryFn: () => api.listProducts(search, page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <div className="row">
        <h1>Products</h1>
        {email && <Link to="/products/new" className="button">Add product</Link>}
      </div>

      <input
        type="search"
        placeholder="Search by name"
        aria-label="Search products by name"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {isLoading && <p className="muted">Loading products…</p>}
      {isError && <p role="alert" className="error">Could not load products: {error.message}</p>}

      {data && (
        <>
          {data.items.length === 0 ? (
            <p className="muted">No products match “{search}”. Try a shorter search.</p>
          ) : (
            <div className="scroll">
              <table style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
                <thead>
                  <tr><th>Name</th><th>Description</th><th className="num">Price</th><th className="num">Stock</th>{email && <th />}</tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td className="muted">{p.description}</td>
                      <td className="num">{money.format(p.price)}</td>
                      <td className="num">{p.stock}</td>
                      {email && (
                        <td className="actions">
                          <Link to={`/products/${p.id}/edit`}>Edit</Link>
                          <button
                            className="link danger"
                            disabled={remove.isPending}
                            onClick={() => window.confirm(`Delete ${p.name}?`) && remove.mutate(p.id)}
                          >Delete</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="row pager">
            <span className="muted">{data.total} products · page {data.page} of {totalPages}</span>
            <span>
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <button disabled={page >= totalPages || isPlaceholderData} onClick={() => setPage((p) => p + 1)}>Next</button>
            </span>
          </div>
        </>
      )}
      {remove.isError && <p role="alert" className="error">{remove.error.message}</p>}
    </>
  );
}
