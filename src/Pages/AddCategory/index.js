import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";

function AddCategory() {
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [sorting, setSorting] = useState({ field: "", ascending: true });
  const navigate = useNavigate();

  useEffect(() => {
    const storedCategories =
      JSON.parse(localStorage.getItem("categories")) || [];

    // Ordenar categorias ascendente ao carregar
    const sortedCategories = [...storedCategories].sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) return -1;
      if (a.toLowerCase() > b.toLowerCase()) return 1;
      return 0;
    });
    setCategories(sortedCategories);
  }, []);

  const handleAddCategory = () => {
    if (!newCategory) {
      alert("Preencha o nome da categoria!");
      return;
    }

    const categoryExists = categories.some(
      (cat) => cat.toLowerCase() === newCategory.toLowerCase()
    );
    if (categoryExists) {
      alert("Esta categoria já existe!");
      setNewCategory("");
      return;
    }

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem("categories", JSON.stringify(updatedCategories));
    navigate("/Stock");
  };

  const handleDeleteCategory = (index) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    localStorage.setItem("categories", JSON.stringify(updatedCategories));
  };

  const handleEditCategory = (index) => {
    setEditingIndex(index);
    setEditingCategory(categories[index]);
  };

  const handleSaveEdit = (index) => {
    if (!editingCategory) {
      alert("Categoria não pode ser vazia!");
      return;
    }
    const updatedCategories = [...categories];
    updatedCategories[index] = editingCategory;
    setCategories(updatedCategories);
    localStorage.setItem("categories", JSON.stringify(updatedCategories));
    setEditingIndex(null);
    setEditingCategory("");
  };

  const handleSort = () => {
    const isAscending =
      sorting.field === "category" ? !sorting.ascending : true;
    const sortedCategories = [...categories].sort((a, b) => {
      if (a.toLowerCase() < b.toLowerCase()) return isAscending ? -1 : 1;
      if (a.toLowerCase() > b.toLowerCase()) return isAscending ? 1 : -1;
      return 0;
    });
    setSorting({ field: "category", ascending: isAscending });
    setCategories(sortedCategories);
  };

  return (
    <div className="stock-container">
      <div className="btn-back">
        <Link to="/Stock" className="btn">
          Voltar
        </Link>
      </div>
      <h2>Gerenciamento de Categorias</h2>

      <div className="add-category-container">
        <input
          type="text"
          placeholder="Nova categoria"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAddCategory} className="btn">
          Adicionar Categoria
        </button>
      </div>

      <table className="stock-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("category")}>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={index}>
              {editingIndex === index ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editingCategory}
                      onChange={(e) => setEditingCategory(e.target.value)}
                      className="input-field"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="btn"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="btn"
                    >
                      Cancelar
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{cat}</td>
                  <td>
                    <button
                      onClick={() => handleEditCategory(index)}
                      className="btn"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(index)}
                      className="btn"
                    >
                      Excluir
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AddCategory;
