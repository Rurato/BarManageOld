import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import "./styles.css";

function Stock() {
  const [stock, setStock] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [sorting, setSorting] = useState({ field: "", ascending: true });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const storedStock = JSON.parse(localStorage.getItem("stock")) || [];
    setStock(storedStock);

    const uniqueCategories = [
      ...new Set(storedStock.map((item) => item.category)),
    ];
    setCategories(uniqueCategories);

    const storedCategories = JSON.parse(localStorage.getItem("categories")) || [];
    if (storedCategories.length) {
      setCategories(storedCategories);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  const handleAddItem = () => {
    if (itemName && itemQuantity && itemPrice && itemCategory) {
      const newItem = {
        name: itemName,
        category: itemCategory,
        quantity: parseInt(itemQuantity, 10),
        price: parseFloat(itemPrice),
      };
      const updatedStock = [...stock, newItem];
      setStock(updatedStock);
      localStorage.setItem("stock", JSON.stringify(updatedStock));
      setItemName("");
      setItemQuantity("");
      setItemPrice("");
      setItemCategory("");
    } else {
      alert("Preencha todos os campos!");
    }
  };

  const handleDeleteItem = (index) => {
    const updatedStock = stock.filter((_, idx) => idx !== index);
    setStock(updatedStock);
    localStorage.setItem("stock", JSON.stringify(updatedStock));
  };

  const handleEditItem = (index) => {
    setEditingIndex(index);
    const item = stock[index];
    setItemName(item.name);
    setItemQuantity(item.quantity.toString());
    setItemPrice(item.price.toString());
    setItemCategory(item.category);
  };

  const handleSaveEdit = (index) => {
    const updatedStock = [...stock];
    updatedStock[index] = {
      name: itemName || stock[index].name,
      quantity: itemQuantity ? parseInt(itemQuantity, 10) : stock[index].quantity,
      price: itemPrice ? parseFloat(itemPrice) : stock[index].price,
      category: itemCategory || stock[index].category,
    };
    setStock(updatedStock);
    localStorage.setItem("stock", JSON.stringify(updatedStock));
    setEditingIndex(null);
    setItemName("");
    setItemQuantity("");
    setItemPrice("");
    setItemCategory("");
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
      Preço: item.price.toFixed(2).replace('.', ','),
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

  const getQuantityColor = (quantity) => {
    if (quantity > 100) return "green";
    if (quantity >= 50) return "orange";
    return "red";
  };

  return (
    <div className="stock-container">
      <div className="back">
        <Link to="/Dashboard" className="btn">Voltar</Link>
      </div>
      <h2>Gerenciamento de Estoque</h2>

      <button onClick={handleExportToExcel} className="btn">
        Exportar Estoque para Excel
      </button>

      <div className="add-item-container">
        <input
          type="text"
          placeholder="Nome do Item"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="input-field"
        />

        <select
          value={itemCategory}
          onChange={(e) => setItemCategory(e.target.value)}
          className="input-field"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantidade"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Preço"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAddItem} className="btn">
          Adicionar Item
        </button>
      </div>

      <div className="add-category-container">
        <input
          type="text"
          placeholder="Nova categoria"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="input-field"
        />
        <button
          onClick={() => {
            if (newCategory && !categories.includes(newCategory)) {
              setCategories([...categories, newCategory]);
              setNewCategory("");
            }
          }}
          className="btn"
        >
          Adicionar Categoria
        </button>
      </div>

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
            <th onClick={() => handleSort("price")}>Preço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredStock.map((item, index) => (
            <tr key={index}>
              {editingIndex === index ? (
                <>
                  <td><input type="text" defaultValue={item.name} onChange={(e) => setItemName(e.target.value)} className="input-field" /></td>
                  <td>
                    <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="input-field">
                      <option value="">Selecione uma categoria</option>
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td><input type="number" defaultValue={item.quantity} onChange={(e) => setItemQuantity(e.target.value)} className="input-field" /></td>
                  <td><input type="number" defaultValue={item.price} onChange={(e) => setItemPrice(e.target.value)} className="input-field" /></td>
                  <td>
                    <button onClick={() => handleSaveEdit(index)} className="btn">Salvar</button>
                    <button onClick={() => setEditingIndex(null)} className="btn">Cancelar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td style={{ color: getQuantityColor(item.quantity), fontWeight: "bold" }}>{item.quantity}</td>
                  <td>R${item.price.toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleEditItem(index)} className="btn">Editar</button>
                    <button onClick={() => handleDeleteItem(index)} className="btn">Remover</button>
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
