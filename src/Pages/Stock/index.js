import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import "./styles.css";

function Stock() {
  const [stock, setStock] = useState([]);
  const [itemName, setItemName] = useState("");

  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [sorting, setSorting] = useState({ field: "", ascending: true });
  const [categories, setCategories] = useState([]);
  const [addQuantity, setAddQuantity] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");

  useEffect(() => {
    const storedStock = JSON.parse(localStorage.getItem("stock")) || [];

    // Ordenar estoque por nome ascendente ao carregar
    const sortedStock = [...storedStock].sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      return 0;
    });
    setStock(sortedStock);

    const uniqueCategories = [
      ...new Set(sortedStock.map((item) => item.category)),
    ];
    setCategories(uniqueCategories);

    const storedCategories =
      JSON.parse(localStorage.getItem("categories")) || [];
    if (storedCategories.length) {
      setCategories(storedCategories);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  const handleDeleteItem = (index) => {
    const updatedStock = stock.filter((_, idx) => idx !== index);
    setStock(updatedStock);
    localStorage.setItem("stock", JSON.stringify(updatedStock));
  };

  const handleEditItem = (index) => {
    setEditingIndex(index);
    const item = stock[index];
    setItemName(item.name);

    setItemPrice(item.price.toString());
    setItemCategory(item.category);
    setAddQuantity("");
    setRemoveQuantity("");
  };

  const handleSaveEdit = (index) => {
    const updatedStock = [...stock];
    const currentQuantity = updatedStock[index].quantity;

    const added = parseInt(addQuantity || "0", 10);
    const removed = parseInt(removeQuantity || "0", 10);
    let newQuantity = currentQuantity + added - removed;
    if (newQuantity < 0) newQuantity = 0;

    updatedStock[index] = {
      ...updatedStock[index],
      name: itemName || updatedStock[index].name,
      category: itemCategory || updatedStock[index].category,
      price: itemPrice ? parseFloat(itemPrice) : updatedStock[index].price,
      quantity: newQuantity,
    };

    setStock(updatedStock);
    localStorage.setItem("stock", JSON.stringify(updatedStock));
    setEditingIndex(null);
    setItemName("");
    setItemPrice("");
    setItemCategory("");
    setAddQuantity("");
    setRemoveQuantity("");
  };

  const handleSort = (field) => {
    const isAscending = sorting.field === field ? !sorting.ascending : true;
    const sortedStock = [...stock].sort((a, b) => {
      if (a[field] < b[field]) return isAscending ? -1 : 1;
      if (a[field] > b[field]) return isAscending ? 1 : -1;
      return 0;
    });
    setSorting({ field, ascending: isAscending });
    setStock(sortedStock);
  };

  const handleExportToExcel = () => {
    const data = stock.map((item) => ({
      Nome: item.name,
      Categoria: item.category,
      Quantidade: item.quantity,
      Preço: item.price.toFixed(2).replace(".", ","),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");
    const date = new Date().toISOString().slice(0, 10);
    const filename = `relatorio-estoque-${date}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const filteredStock = stock.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      item.category.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const getQuantityColor = (quantity, minQuantity) => {
    if (quantity <= minQuantity) return "red";
    if (quantity > minQuantity) return "black";
  };

  return (
    <div className="stock-container">
      <div className="back">
        <Link to="/Dashboard" className="btn">
          Voltar
        </Link>
      </div>
      <h2>Gerenciamento de Estoque</h2>

      <button className="btn-link">
        <Link to="/AddItem" className="btn">
          Cadastrar Produto
        </Link>
      </button>
      <button className="btn-link">
        <Link to="/AddCategory" className="btn">
          Cadastrar Categoria
        </Link>
      </button>

      <button onClick={handleExportToExcel} className="btn">
        Exportar para Excel
      </button>

      <div className="search-container">
        <input
          type="text"
          placeholder="Pesquisar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Pesquisar por categoria..."
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="input-field"
        />
      </div>

      <table className="stock-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>Nome</th>
            <th onClick={() => handleSort("category")}>Categoria</th>
            <th onClick={() => handleSort("quantity")}>Quantidade</th>
            {editingIndex !== null && <th>Adicionar</th>}
            {editingIndex !== null && <th>Remover</th>}
            <th onClick={() => handleSort("price")}>Preço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredStock.map((item, index) => (
            <tr key={index}>
              {editingIndex === index ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="input-field"
                    />
                  </td>
                  <td>
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
                  </td>
                  <td
                    style={{
                      color: getQuantityColor(item.quantity, item.minQuantity),
                      fontWeight: "bold",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={addQuantity}
                      onChange={(e) => setAddQuantity(e.target.value)}
                      className="input-field"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={removeQuantity}
                      onChange={(e) => setRemoveQuantity(e.target.value)}
                      className="input-field"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
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
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td
                    style={{
                      color: getQuantityColor(item.quantity, item.minQuantity),
                    }}
                  >
                    {item.quantity}
                  </td>
                  {editingIndex !== null && <td></td>}
                  {editingIndex !== null && <td></td>}
                  <td>R${item.price.toFixed(2)}</td>
                  <td>
                    <button className="btn-link">
                      <Link to={`/EditItem/${index}`} className="btn">
                        Editar
                      </Link>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="btn"
                    >
                      Remover
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

export default Stock;
