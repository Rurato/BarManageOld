import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

function Tables() {
  const [tables, setTables] = useState([]);
  const [stock, setStock] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [responsible, setResponsible] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("");

  useEffect(() => {
    const storedTables = JSON.parse(localStorage.getItem("tables")) || [];
    const storedStock = JSON.parse(localStorage.getItem("stock")) || [];
    setTables(storedTables);
    setStock(storedStock);
  }, []);

  const handleTableClick = (index) => {
    setSelectedTable(index);
  };

  const handleAssignTable = () => {
    const updatedTables = [...tables];
    updatedTables[selectedTable] = {
      responsible: responsible,
      items: [],
    };
    setTables(updatedTables);
    localStorage.setItem("tables", JSON.stringify(updatedTables));
    setSelectedTable(null);
    setResponsible("");
  };

  const handleAddItemToTable = () => {
    if (!selectedItem || !selectedQuantity) {
      alert("Preencha os campos de item e quantidade!");
      return;
    }

    const item = stock.find((i) => i.name === selectedItem);
    if (!item || item.quantity < selectedQuantity) {
      alert("Quantidade insuficiente no estoque!");
      setSelectedItem("");
      setSelectedQuantity("");
      setSelectedCategory("");
      return;
    }

    const updatedStock = stock.map((i) =>
      i.name === selectedItem
        ? { ...i, quantity: i.quantity - selectedQuantity }
        : i
    );

    const updatedTables = [...tables];
    const currentItems = updatedTables[selectedTable]?.items || [];
    updatedTables[selectedTable].items = [
      ...currentItems,
      { name: selectedItem, quantity: selectedQuantity, price: item.price },
    ];

    setStock(updatedStock);
    setTables(updatedTables);
    localStorage.setItem("stock", JSON.stringify(updatedStock));
    localStorage.setItem("tables", JSON.stringify(updatedTables));
    setSelectedItem("");
    setSelectedQuantity("");
    setSelectedCategory("");

    if (item.quantity - selectedQuantity < 10) {
      alert(`Aviso: Estoque do item "${item.name}" muito baixo!`);
    }
  };

  const handleCloseTable = () => {
    const updatedTables = [...tables];
    const table = updatedTables[selectedTable];
    const total = table.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const closedTableEntry = {
      responsible: table.responsible,
      items: table.items,
      total,
      timestamp: Date.now(),
    };

    const storedHistory = JSON.parse(localStorage.getItem("history")) || [];
    const updatedHistory = [...storedHistory, closedTableEntry];
    localStorage.setItem("history", JSON.stringify(updatedHistory));

    alert(
      `Comanda de ${table.responsible} fechada!\nItens Consumidos:\n` +
        table.items
          .map(
            (item) =>
              `- ${item.name} (${item.quantity}x) - R$${(
                item.price * item.quantity
              ).toFixed(2)}`
          )
          .join("\n") +
        `\nTotal: R$${total.toFixed(2)}`
    );

    // Remover comanda após fechar
    updatedTables.splice(selectedTable, 1);
    setTables(updatedTables);
    localStorage.setItem("tables", JSON.stringify(updatedTables));
    setSelectedTable(null);
  };

  const handleAddTable = () => {
    const updatedTables = [...tables, null];
    setTables(updatedTables);
    localStorage.setItem("tables", JSON.stringify(updatedTables));
  };

  const handleRemoveOpenTable = () => {
    const updatedTables = [...tables];
    updatedTables.splice(selectedTable, 1); // remove a comanda aberta selecionada
    setTables(updatedTables);
    localStorage.setItem("tables", JSON.stringify(updatedTables));
    setSelectedTable(null);
  };

  const handleRemoveItemFromTable = (tableIdx, itemIdx) => {
    const item = tables[tableIdx].items[itemIdx];

    const updatedTables = [...tables];
    updatedTables[tableIdx].items.splice(itemIdx, 1);

    const updatedStock = stock.map((s) =>
      s.name === item.name ? { ...s, quantity: s.quantity + item.quantity } : s
    );

    setTables(updatedTables);
    setStock(updatedStock);
    localStorage.setItem("tables", JSON.stringify(updatedTables));
    localStorage.setItem("stock", JSON.stringify(updatedStock));
  };

  const categories = [...new Set(stock.map((item) => item.category))];

  return (
    <div className="tables-container">
      <div className="back">
        <Link to="/Dashboard" className="btn">
          Voltar
        </Link>
        <Link to="/History" className="btn">
          Ver Histórico
        </Link>
      </div>
      <h2>Gerenciamento de Comandas</h2>
      <div className="tables-grid">
        {tables.map((table, index) => (
          <div
            key={index}
            className={`table-icon ${table ? "occupied" : "available"}`}
            onClick={() => handleTableClick(index)}
          >
            {table ? `${table.responsible}` : "Disponível"}
          </div>
        ))}
      </div>
      <div className="add-table">
        <button onClick={handleAddTable} className="btn ">
          Adicionar Comanda
        </button>
      </div>
      <hr />
      {selectedTable !== null && (
        <div className="form-container">
          {tables[selectedTable] ? (
            <>
              <h3>Itens da Comanda: {tables[selectedTable].responsible}</h3>
              <ul>
                {tables[selectedTable].items.map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>
                      <strong>#</strong> {item.name} ({item.quantity}x) - R$
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className="btn"
                      onClick={() =>
                        handleRemoveItemFromTable(selectedTable, idx)
                      }
                    >
                      Remover Item
                    </button>
                  </li>
                ))}
              </ul>
              <h3>Adicionar Item</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field-tables"
              >
                <option value="">Selecione uma Categoria</option>
                {categories.map((category, idx) => (
                  <option key={idx} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="input-field-tables"
                >
                  <option value="">Selecione um Item</option>
                  {stock
                    .filter((item) => item.category === selectedCategory)
                    .map((item, idx) => (
                      <option key={idx} value={item.name}>
                        {item.name} R${item.price} (Estoque: {item.quantity})
                      </option>
                    ))}
                </select>
              )}
              <input
                type="number"
                placeholder="Quantidade"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                className="input-field-tables"
              />
              <button onClick={handleAddItemToTable} className="btn">
                Adicionar
              </button>
              <button onClick={handleCloseTable} className="btn close-command">
                Finalizar Comanda
              </button>
              <button onClick={handleRemoveOpenTable} className="btn">
                Remover
              </button>
            </>
          ) : (
            <>
              <h3>Comanda Disponível</h3>
              <input
                type="text"
                placeholder="Nome do Responsável"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="input-field-tables"
              />
              <button onClick={handleAssignTable} className="btn">
                Atribuir
              </button>
              <button onClick={handleRemoveOpenTable} className="btn">
                Remover
              </button>
            </>
          )}
          <button onClick={() => setSelectedTable(null)} className="btn">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

export default Tables;
