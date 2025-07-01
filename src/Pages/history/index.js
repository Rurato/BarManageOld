import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './styles.css';

function History() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  // Função para obter a data de hoje no formato yyyy-mm-dd
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('history')) || [];
    const sortedHistory = storedHistory.sort((a, b) => b.timestamp - a.timestamp);
    setHistory(sortedHistory);

    const hoje = getTodayDate();
    setDataInicial(hoje);
    setDataFinal(hoje);
  }, []);

  useEffect(() => {
    if (!dataInicial && !dataFinal) {
      setFilteredHistory(history);
      return;
    }

    const start = dataInicial ? new Date(dataInicial + 'T00:00:00') : null;
    const end = dataFinal ? new Date(dataFinal + 'T23:59:59') : null;

    const filtered = history.filter(entry => {
      const ts = entry.timestamp;
      return (!start || ts >= start.getTime()) && (!end || ts <= end.getTime());
    });

    setFilteredHistory(filtered);
  }, [dataInicial, dataFinal, history]);

  const clearHistory = () => {
    if (window.confirm("Tem certeza que deseja limpar o histórico?")) {
      localStorage.removeItem('history');
      setHistory([]);
      setFilteredHistory([]);
      alert("Histórico limpo com sucesso!");
    }
  };

  const exportToExcel = () => {
    if (filteredHistory.length === 0) {
      alert("Nenhum dado filtrado para exportar.");
      return;
    }

    const dataToExport = filteredHistory.map(entry => ({
      Responsável: entry.responsible,
      Mesa: entry.tableNumber || '-',
      Total: entry.total.toFixed(2),
      FechadaEm: new Date(entry.timestamp).toLocaleString(),
      Itens: entry.items.map(item => `${item.name} (${item.quantity}x)`).join(', '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico');

    const agora = new Date();
    const nomeArquivo = `historico_${agora.toLocaleDateString('pt-BR')}_${agora.toLocaleTimeString('pt-BR')}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
  };

  const resetFiltrosParaHoje = () => {
    const hoje = getTodayDate();
    setDataInicial(hoje);
    setDataFinal(hoje);
  };

  return (
    <div className="history-container">
      <div className="back">
        <Link to="/Tables" className="btn">Voltar</Link>
      </div>

      <h2>Histórico de Comandas Fechadas</h2>

      <div className="filtros-data" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label>Data Inicial:</label>
          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label>Data Final:</label>
          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="input-field"
          />
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button onClick={resetFiltrosParaHoje} className="btn btn-clear">Limpar Filtros</button>
        </div>
      </div>

      <div className="button-container">
        <button onClick={clearHistory} className="btn btn-clear">Limpar Histórico</button>
        <button onClick={exportToExcel} className="btn btn-export">Exportar para Excel</button>
      </div>

      {filteredHistory.length === 0 ? (
        <p>Nenhuma comanda encontrada para o período selecionado.</p>
      ) : (
        <ul>
          {filteredHistory.map((entry, index) => (
            <li key={index}>
              <h3>Responsável: {entry.responsible}</h3>
              {entry.tableNumber && <p>Comanda {entry.tableNumber}</p>}
              <ul>
                {entry.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} ({item.quantity}x) - R${(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p><strong>Total:</strong> R${entry.total.toFixed(2)}</p>
              <p><small>Fechada em: {new Date(entry.timestamp).toLocaleString()}</small></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;
