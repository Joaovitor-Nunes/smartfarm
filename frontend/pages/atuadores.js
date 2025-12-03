import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/atuadores.module.css';

// Configuração do ESP32 (mantendo consistência)
const ESP32_IP = "http://10.106.33.1";

export default function Atuador() {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Pronto');
  const [sensorData, setSensorData] = useState(null);
  const [isLoadingSensors, setIsLoadingSensors] = useState(true);

  // Função para enviar comandos aos atuadores
  const sendCmd = async (cmd) => {
    if (isSending) return;
    
    setIsSending(true);
    setConnectionStatus('Enviando comando...');
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 800);
      
      await fetch(`${ESP32_IP}/actuator?cmd=${cmd}`, {
        signal: controller.signal 
      });
      
      clearTimeout(timeout);
      
      console.log("Comando enviado:", cmd);
      setLastCommand({
        cmd,
        timestamp: new Date().toLocaleTimeString(),
        status: 'success'
      });
      
      // Adiciona ao histórico
      setCommandHistory(prev => [
        {
          id: Date.now(),
          command: cmd,
          timestamp: new Date().toLocaleTimeString(),
          status: 'success'
        },
        ...prev.slice(0, 9) // Mantém apenas últimos 10
      ]);
      
      setConnectionStatus('Comando enviado com sucesso!');
      
      // Feedback visual temporário
      setTimeout(() => {
        setConnectionStatus('Pronto');
      }, 2000);
      
    } catch (erro) {
      console.warn("Erro ao enviar comando:", erro);
      
      setLastCommand({
        cmd,
        timestamp: new Date().toLocaleTimeString(),
        status: 'error'
      });
      
      // Adiciona erro ao histórico
      setCommandHistory(prev => [
        {
          id: Date.now(),
          command: cmd,
          timestamp: new Date().toLocaleTimeString(),
          status: 'error',
          error: erro.message
        },
        ...prev.slice(0, 9)
      ]);
      
      setConnectionStatus('Erro ao enviar comando');
      
      setTimeout(() => {
        setConnectionStatus('Pronto');
      }, 3000);
      
    } finally {
      setIsSending(false);
    }
  };

  // Função para buscar dados dos sensores (para contexto)
  const fetchSensorData = async () => {
    try {
      setIsLoadingSensors(true);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      
      const res = await fetch(`${ESP32_IP}/sensors`, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeout);
      
      if (!res.ok) {
        throw new Error("Falha ao obter dados dos sensores");
      }
      
      const data = await res.json();
      setSensorData(data);
      
    } catch (erro) {
      console.error("Erro ao conectar com o ESP32:", erro);
      // Dados simulados para demonstração
      setSensorData({
        temperature: 24.8,
        humidity: 60,
        soil: 45,
        light: 70,
        water: 35
      });
      
    } finally {
      setIsLoadingSensors(false);
    }
  };

  // Configura atualização periódica dos sensores
  useEffect(() => {
    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 5000); // Atualiza a cada 5s
    
    return () => clearInterval(intervalId);
  }, []);

  // Atuadores disponíveis
  const actuators = [
    { 
      id: 'LED', 
      name: 'Controle de LED', 
      description: 'Liga/Desliga LEDs da estufa',
      icon: '💡', 
      color: '#ffd166',
      cmd: 'LED',
      status: 'ready'
    },
    { 
      id: 'FAN', 
      name: 'Ventilador', 
      description: 'Controle do sistema de ventilação',
      icon: '🌀', 
      color: '#4ecdc4',
      cmd: 'FAN',
      status: 'ready'
    },
    { 
      id: 'FEED', 
      name: 'Sistema de Alimentação', 
      description: 'Aciona o dispensador de ração',
      icon: '🥕', 
      color: '#06d6a0',
      cmd: 'FEED',
      status: 'ready'
    },
    { 
      id: 'WATER', 
      name: 'Sistema de Irrigação', 
      description: 'Aciona a bomba de água',
      icon: '💧', 
      color: '#118ab2',
      cmd: 'WATER',
      status: 'ready'
    },
    { 
      id: 'PUMP', 
      name: 'Bomba de Água', 
      description: 'Controle manual da bomba',
      icon: '⛲', 
      color: '#1d4e89',
      cmd: 'PUMP',
      status: 'ready'
    },
    { 
      id: 'ALL_ON', 
      name: 'Ligar Todos', 
      description: 'Ativa todos os sistemas',
      icon: '🔛', 
      color: '#2a9d8f',
      cmd: 'ALL_ON',
      status: 'ready'
    },
    { 
      id: 'ALL_OFF', 
      name: 'Desligar Todos', 
      description: 'Desativa todos os sistemas',
      icon: '🔴', 
      color: '#e63946',
      cmd: 'ALL_OFF',
      status: 'ready'
    },
    { 
      id: 'AUTO', 
      name: 'Modo Automático', 
      description: 'Ativa o modo automático',
      icon: '🤖', 
      color: '#9d4edd',
      cmd: 'AUTO',
      status: 'ready'
    }
  ];

  // Função para obter recomendação baseada nos sensores
  const getRecommendation = () => {
    if (!sensorData) return "Aguardando dados dos sensores...";
    
    const recommendations = [];
    
    if (sensorData.temperature > 28) {
      recommendations.push("🌡️ Temperatura alta - Ativar ventilador");
    }
    
    if (sensorData.soil < 30) {
      recommendations.push("🌱 Solo seco - Ativar irrigação");
    }
    
    if (sensorData.water < 20) {
      recommendations.push("🚰 Nível de água baixo - Verificar reservatório");
    }
    
    if (sensorData.light < 30) {
      recommendations.push("☀️ Pouca luminosidade - Ativar LEDs");
    }
    
    return recommendations.length > 0 
      ? recommendations.join(" | ")
      : "✅ Todos os parâmetros dentro do ideal";
  };

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            onClick={() => router.back()} 
            className={styles.backButton}
          >
            ← Voltar
          </button>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>⚙️</span>
            Controle de Atuadores
          </h1>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.connectionStatus}>
            <span className={`${styles.statusDot} ${connectionStatus.includes('sucesso') ? styles.success : connectionStatus.includes('Erro') ? styles.error : styles.ready}`}></span>
            {connectionStatus}
          </div>
          <div className={styles.lastUpdate}>
            {lastCommand ? `Último comando: ${lastCommand.cmd}` : 'Nenhum comando enviado'}
          </div>
        </div>
      </div>

      {/* Status da Conexão */}
      <div className={styles.connectionCard}>
        <div className={styles.connectionInfo}>
          <h3>🌐 Controle do ESP32</h3>
          <p><strong>Endereço IP:</strong> {ESP32_IP}</p>
          <p><strong>Endpoint:</strong> {ESP32_IP}/actuator?cmd=COMANDO</p>
          <p><strong>Status:</strong> 
            <span className={connectionStatus.includes('sucesso') ? styles.statusGood : connectionStatus.includes('Erro') ? styles.statusBad : styles.statusReady}>
              {connectionStatus}
            </span>
          </p>
          <p><strong>Comandos suportados:</strong> LED, FAN, FEED, WATER, etc.</p>
        </div>
        
        <div className={styles.connectionActions}>
          <button 
            onClick={() => sendCmd('TEST')} 
            className={styles.testButton}
            disabled={isSending}
          >
            {isSending ? '⏳ Testando...' : '🧪 Testar Conexão'}
          </button>
          <span className={styles.updateInfo}>
            Clique para testar comunicação com ESP32
          </span>
        </div>
      </div>

      {/* Seção de Recomendações */}
      <div className={styles.recommendationSection}>
        <div className={styles.recommendationCard}>
          <div className={styles.recommendationHeader}>
            <span className={styles.recommendationIcon}>🤖</span>
            <h3>Recomendações Automáticas</h3>
          </div>
          <div className={styles.recommendationContent}>
            <p>{getRecommendation()}</p>
            <div className={styles.sensorStatus}>
              <span className={styles.sensorStatusItem}>
                🌡️ {sensorData?.temperature?.toFixed(1) || '--'}°C
              </span>
              <span className={styles.sensorStatusItem}>
                🌱 {sensorData?.soil?.toFixed(0) || '--'}%
              </span>
              <span className={styles.sensorStatusItem}>
                🚰 {sensorData?.water?.toFixed(0) || '--'}%
              </span>
              <span className={styles.sensorStatusItem}>
                ☀️ {sensorData?.light?.toFixed(0) || '--'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Atuadores */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🎮</span>
          Controle Manual dos Atuadores
        </h2>
        <p className={styles.sectionDescription}>
          Clique em qualquer atuador para enviar o comando correspondente ao ESP32.
        </p>
        
        <div className={styles.actuatorsGrid}>
          {actuators.map((actuator) => (
            <div key={actuator.id} className={styles.actuatorCard}>
              <div 
                className={styles.actuatorHeader}
                style={{ borderLeftColor: actuator.color }}
              >
                <div className={styles.actuatorIcon}>{actuator.icon}</div>
                <div className={styles.actuatorInfo}>
                  <h3 className={styles.actuatorName}>{actuator.name}</h3>
                  <span className={styles.actuatorCmd}>
                    Comando: <code>{actuator.cmd}</code>
                  </span>
                </div>
                <span className={`${styles.actuatorStatus} ${styles[actuator.status]}`}>
                  {actuator.status === 'ready' ? 'PRONTO' : 'OCUPADO'}
                </span>
              </div>
              
              <p className={styles.actuatorDescription}>
                {actuator.description}
              </p>
              
              <div className={styles.actuatorActions}>
                <button 
                  onClick={() => sendCmd(actuator.cmd)}
                  className={styles.controlButton}
                  style={{ backgroundColor: actuator.color }}
                  disabled={isSending}
                >
                  {isSending ? '⏳ Enviando...' : '▶️ Executar Comando'}
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm(`Enviar comando ${actuator.cmd} para o ESP32?`)) {
                      sendCmd(actuator.cmd);
                    }
                  }}
                  className={styles.confirmButton}
                >
                  🔍 Confirmar e Enviar
                </button>
              </div>
              
              <div className={styles.actuatorFooter}>
                <span className={styles.actuatorId}>
                  ID: {actuator.id}
                </span>
                <span className={styles.actuatorEndpoint}>
                  GET /actuator?cmd={actuator.cmd}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles Rápidos */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>⚡</span>
          Controles Rápidos
        </h2>
        
        <div className={styles.quickControls}>
          <button 
            onClick={() => sendCmd('LED')}
            className={styles.quickButton}
            style={{ backgroundColor: '#ffd166' }}
            disabled={isSending}
          >
            <span className={styles.quickIcon}>💡</span>
            LED
          </button>
          
          <button 
            onClick={() => sendCmd('FAN')}
            className={styles.quickButton}
            style={{ backgroundColor: '#4ecdc4' }}
            disabled={isSending}
          >
            <span className={styles.quickIcon}>🌀</span>
            Ventilador
          </button>
          
          <button 
            onClick={() => sendCmd('FEED')}
            className={styles.quickButton}
            style={{ backgroundColor: '#06d6a0' }}
            disabled={isSending}
          >
            <span className={styles.quickIcon}>🥕</span>
            Alimentar
          </button>
          
          <button 
            onClick={() => sendCmd('WATER')}
            className={styles.quickButton}
            style={{ backgroundColor: '#118ab2' }}
            disabled={isSending}
          >
            <span className={styles.quickIcon}>💧</span>
            Regar
          </button>
          
          <button 
            onClick={() => sendCmd('ALL_ON')}
            className={styles.quickButton}
            style={{ backgroundColor: '#2a9d8f' }}
            disabled={isSending}
          >
            <span className={styles.quickIcon}>🔛</span>
            Ligar Tudo
          </button>
          
          <button 
            onClick={() => sendCmd('ALL_OFF')}
            className={styles.quickButton}
            style={{ backgroundColor: '#e63946' }}
            disabled={isSending}
          >
            <span className={styles.quickIcon}>🔴</span>
            Desligar Tudo
          </button>
        </div>
      </div>

      {/* Histórico de Comandos */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📋</span>
          Histórico de Comandos
        </h2>
        
        <div className={styles.historyCard}>
          <div className={styles.historyHeader}>
            <h3>Últimos Comandos Enviados</h3>
            <button 
              onClick={() => setCommandHistory([])}
              className={styles.clearButton}
            >
              🗑️ Limpar Histórico
            </button>
          </div>
          
          <div className={styles.historyContent}>
            {commandHistory.length > 0 ? (
              <div className={styles.historyList}>
                {commandHistory.map((item) => (
                  <div key={item.id} className={`${styles.historyItem} ${styles[item.status]}`}>
                    <div className={styles.historyCommand}>
                      <span className={styles.historyIcon}>
                        {item.status === 'success' ? '✅' : '❌'}
                      </span>
                      <code className={styles.historyCmd}>{item.command}</code>
                    </div>
                    <div className={styles.historyDetails}>
                      <span className={styles.historyTime}>{item.timestamp}</span>
                      <span className={styles.historyStatus}>
                        {item.status === 'success' ? 'Enviado com sucesso' : `Erro: ${item.error || 'Falha na comunicação'}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noHistory}>
                <div className={styles.noHistoryIcon}>📭</div>
                <h3>Nenhum comando enviado ainda</h3>
                <p>Os comandos enviados aparecerão aqui</p>
              </div>
            )}
          </div>
          
          <div className={styles.historyInfo}>
            <p><strong>Total de comandos:</strong> {commandHistory.length}</p>
            <p><strong>Último comando:</strong> {lastCommand ? `${lastCommand.cmd} às ${lastCommand.timestamp}` : 'Nenhum'}</p>
            <p><strong>Taxa de sucesso:</strong> {
              commandHistory.length > 0 
                ? `${(commandHistory.filter(c => c.status === 'success').length / commandHistory.length * 100).toFixed(0)}%`
                : '0%'
            }</p>
          </div>
        </div>
      </div>

      {/* Informações Técnicas */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <h3>🔧 Como Funciona</h3>
          <p>1. Cada botão envia um comando HTTP GET para o ESP32</p>
          <p>2. O ESP32 processa o comando e aciona o atuador correspondente</p>
          <p>3. O sistema aguarda confirmação da execução</p>
          <p>4. O histórico mantém registro de todos os comandos</p>
        </div>
        
        <div className={styles.infoCard}>
          <h3>⚠️ Precauções</h3>
          <p>• Verifique os sensores antes de acionar sistemas</p>
          <p>• Não acione a irrigação com nível de água baixo</p>
          <p>• Use o modo automático para operação contínua</p>
          <p>• Monitore o histórico para diagnóstico</p>
        </div>
      </div>

      {/* Navegação */}
      <div className={styles.navigation}>
        <Link href="/sensores" className={styles.navButton}>
          <span className={styles.navIcon}>←</span>
          Voltar para Sensores
        </Link>
        <Link href="/" className={styles.navButtonPrimary}>
          Ir para Dashboard
          <span className={styles.navIcon}>→</span>
        </Link>
      </div>
    </div>
  );
}