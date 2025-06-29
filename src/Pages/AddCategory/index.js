import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";

function AddCategory() {
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCategories = JSON.parse(localStorage.getItem("categories")) || [];
    setCategories(storedCategories);
  }, []);

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
      navigate("/Stock");
    } else {
      alert("Categoria já existe ou está vazia!");
    }
  };

  return (
    <div className="stock-container">
      <Link to="/Stock" className="btn">Voltar</Link>
      <h2>Adicionar Categoria</h2>
      <input type="text" placeholder="Nova categoria" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input-field" />
      <button onClick={handleAddCategory} className="btn">Salvar Categoria</button>
    </div>
  );
}

export default AddCategory;