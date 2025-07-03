import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./styles.css";

function EditItem() {
  const { index } = useParams(); // recebe o índice via URL
  const navigate = useNavigate();

  const [stock, setStock] = useState([]);
  const [itemData, setItemData] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    minQuantity: "",
  });

  useEffect(() => {
    const storedStock = JSON.parse(localStorage.getItem("stock")) || [];
    setStock(storedStock);
    const item = storedStock[index];
    if (item) {
      setItemData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        minQuantity: item.minQuantity || "",
      });
    }
  }, [index]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData({ ...itemData, [name]: value });
  };

  const handleSave = () => {
    const updatedStock = [...stock];
    updatedStock[index] = {
      ...updatedStock[index],
      name: itemData.name,
      category: itemData.category,
      quantity: parseInt(itemData.quantity),
      price: parseFloat(itemData.price),
      minQuantity: parseInt(itemData.minQuantity),
    };
    localStorage.setItem("stock", JSON.stringify(updatedStock));
    navigate("/Stock");
  };

  return (
    <div className="edit-item-container">
      <Link to="/Stock" className="btn">
        Voltar
      </Link>
      <h2>Editar Item</h2>
      <div className="edit-item-form">
        <label>Produto: <input
          type="text"
          name="name"
          value={itemData.name}
          onChange={handleChange}
          placeholder="Nome do Item"
          className="input-field"
        /></label>

        <label>Categoria: <input
          type="text"
          name="category"
          value={itemData.category}
          onChange={handleChange}
          placeholder="Categoria"
          className="input-field"
        /></label>

        <label>Quantidade: <input
          type="number"
          name="quantity"
          value={itemData.quantity}
          onChange={handleChange}
          placeholder="Quantidade"
          className="input-field"
        /></label>

        <label>Quant Mínima: <input
          type="number"
          name="minQuantity"
          value={itemData.minQuantity}
          onChange={handleChange}
          placeholder="Quantidade Mínima"
          className="input-field"
        /></label>

        <label>Preço: <input
          type="number"
          name="price"
          value={itemData.price}
          onChange={handleChange}
          placeholder="Preço"
          className="input-field"
        /></label>

        <button onClick={handleSave} className="btn">
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}

export default EditItem;
