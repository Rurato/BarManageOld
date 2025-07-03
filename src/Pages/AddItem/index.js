import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";

function AddItem() {
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [itemMinQuantity, setItemMinQuantity] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedCategories =
      JSON.parse(localStorage.getItem("categories")) || [];
    setCategories(storedCategories);
  }, []);

  const handleAddItem = () => {
    if (itemName && itemQuantity && itemPrice && itemCategory) {
      const storedStock = JSON.parse(localStorage.getItem("stock")) || [];

      //  Verificar duplicidade antes de adicionar
      const itemExists = storedStock.some(
        (item) => item.name.toLowerCase() === itemName.toLowerCase()
      );
      if (itemExists) {
        alert("Este item já existe no estoque!");
        setItemName("");
        setItemQuantity("");
        setItemPrice("");
        setItemCategory("");
        setItemMinQuantity("");
        return;
      }

      const newItem = {
        name: itemName,
        category: itemCategory,
        quantity: parseInt(itemQuantity, 10),
        price: parseFloat(itemPrice),
        minQuantity: parseInt(itemMinQuantity, 10),
      };
      const updatedStock = [...storedStock, newItem];
      localStorage.setItem("stock", JSON.stringify(updatedStock));
      navigate("/Stock");
    } else {
      alert("Preencha todos os campos!");
    }
  };

  return (
    <div className="stock-container">
      <div className="btn-back">
        <Link to="/Stock" className="btn">
          Voltar
        </Link>
      </div>
      <h2>Adicionar Item</h2>
      <hr />
      <div className="stock-form">
        <label>Produto:</label>
        <input
          type="text"
          placeholder="Nome do Item"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="input-field"
        />
        <label>Categoria:</label>
        <select
          value={itemCategory}
          onChange={(e) => setItemCategory(e.target.value)}
          className="input-field"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <label>Quantidade:</label>
        <input
          type="number"
          placeholder="Quantidade"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(e.target.value)}
          className="input-field"
        />
        <label>Quantidade Minima:</label>
        <input
          type="number"
          placeholder="Quantidade Minima"
          value={itemMinQuantity}
          onChange={(e) => setItemMinQuantity(e.target.value)}
          className="input-field"
        />
        <label>Preço:</label> 
        <input
          type="number"
          placeholder="Preço"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAddItem} className="btn">
          Salvar Item
        </button>
      </div>
    </div>
  );
}

export default AddItem;
