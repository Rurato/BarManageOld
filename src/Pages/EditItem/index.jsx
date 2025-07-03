import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./styles.css";

function EditItem() {
  const { index } = useParams(); // recebe o índice via URL
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [addQuantity, setAddQuantity] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
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
    const storedCategories =
      JSON.parse(localStorage.getItem("categories")) || [];
    setCategories(storedCategories);
  }, [index]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData({ ...itemData, [name]: value });
  };

  const handleSave = () => {
    const updatedStock = [...stock];
    const currentQuantity = updatedStock[index].quantity;

    const added = parseInt(addQuantity || "0", 10);
    const removed = parseInt(removeQuantity || "0", 10);
    let newQuantity = currentQuantity + added - removed;
    if (newQuantity < 0) newQuantity = 0;

    updatedStock[index] = {
      ...updatedStock[index],
      name: itemData.name,
      category: itemData.category,
      price: parseFloat(itemData.price),
      quantity: newQuantity,
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
      <hr />
      <div className="edit-item-form">
        <label>Produto: </label>
        <input
          type="text"
          name="name"
          value={itemData.name}
          onChange={handleChange}
          placeholder="Nome do Item"
          className="input-field"
        />

        <label>Categoria: </label>
        <select
          id="category"
          name="category"
          value={itemData.category}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label>Quantidade: </label>
        <input
          type="number"
          name="quantity"
          value={itemData.quantity}
          onChange={handleChange}
          placeholder="Quantidade"
          className="input-field"
        />

        <label >Adição: </label>
        <input
          id="addQuantity"
          type="number"
          name="addQuantity"
          value={addQuantity}
          onChange={(e) => setAddQuantity(e.target.value)}
          placeholder="0"
          className="input-field"
        />

        <label>Remoção: </label>
        <input
          id="removeQuantity"
          type="number"
          name="removeQuantity"
          value={removeQuantity}
          onChange={(e) => setRemoveQuantity(e.target.value)}
          placeholder="0"
          className="input-field"
        />

        <label>Quantidade Mínima: </label>
        <input
          type="number"
          name="minQuantity"
          value={itemData.minQuantity}
          onChange={handleChange}
          placeholder="Quantidade Mínima"
          className="input-field"
        />

        <label>Preço: </label>
        <input
          type="number"
          name="price"
          value={itemData.price}
          onChange={handleChange}
          placeholder="Preço"
          className="input-field"
        />

        <button onClick={handleSave} className="btn">
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}

export default EditItem;
