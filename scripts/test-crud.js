// Script para testar todas as operações CRUD dos estabelecimentos
const API_BASE = 'http://localhost:3333/api';

// Dados de exemplo
const sampleEstabelecimentos = [
  {
    nome: "Restaurante Sabor da Terra",
    tipo: "Restaurante",
    categoria: "Culinária Regional",
    descricao: "Restaurante tradicional de Cajazeiras, especializado em pratos típicos da região com ingredientes frescos e sabores autênticos.",
    endereco: {
      rua: "Rua da Liberdade",
      numero: "123",
      bairro: "Centro",
      cep: "58900-000"
    },
    localizacao: {
      latitude: -6.89,
      longitude: -38.56
    },
    contato: {
      telefone: "(83) 3531-1234",
      whatsapp: "(83) 99999-1234",
      instagram: "@sabordaterra",
      facebook: "https://facebook.com/sabordaterra",
      site: "https://sabordaterra.com.br"
    },
    horario_funcionamento: {
      segunda: { abertura: "11:00", fechamento: "22:00", fechado: false },
      terca: { abertura: "11:00", fechamento: "22:00", fechado: false },
      quarta: { abertura: "11:00", fechamento: "22:00", fechado: false },
      quinta: { abertura: "11:00", fechamento: "22:00", fechado: false },
      sexta: { abertura: "11:00", fechamento: "23:00", fechado: false },
      sabado: { abertura: "11:00", fechamento: "23:00", fechado: false },
      domingo: { abertura: "12:00", fechamento: "21:00", fechado: false }
    },
    servicos: ["Delivery", "Wi-Fi", "Estacionamento", "Reservas"],
    pagamentos: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX"],
    imagens: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"],
    status: "ativo"
  },
  {
    nome: "Bar do Zé",
    tipo: "Bar",
    categoria: "Bar e Petiscos",
    descricao: "Bar tradicional com ambiente familiar, petiscos deliciosos e música ao vivo aos fins de semana.",
    endereco: {
      rua: "Avenida São Sebastião",
      numero: "456",
      bairro: "São Sebastião",
      cep: "58900-000"
    },
    localizacao: {
      latitude: -6.87,
      longitude: -38.54
    },
    contato: {
      telefone: "(83) 3531-5678",
      whatsapp: "(83) 99999-5678",
      instagram: "@bardoze",
      facebook: "https://facebook.com/bardoze"
    },
    horario_funcionamento: {
      segunda: { abertura: "18:00", fechamento: "02:00", fechado: false },
      terca: { abertura: "18:00", fechamento: "02:00", fechado: false },
      quarta: { abertura: "18:00", fechamento: "02:00", fechado: false },
      quinta: { abertura: "18:00", fechamento: "02:00", fechado: false },
      sexta: { abertura: "18:00", fechamento: "03:00", fechado: false },
      sabado: { abertura: "18:00", fechamento: "03:00", fechado: false },
      domingo: { abertura: "18:00", fechamento: "01:00", fechado: false }
    },
    servicos: ["Música ao vivo", "Petiscos", "Wi-Fi", "Estacionamento"],
    pagamentos: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX"],
    imagens: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"],
    status: "ativo"
  }
];

// Funções de teste
async function testCreate() {
  console.log('\n🔄 Testando CREATE...');
  
  for (let estabelecimento of sampleEstabelecimentos) {
    try {
      const response = await fetch(`${API_BASE}/estabelecimentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Nota: Para criar, você precisa estar logado como admin
          // 'Authorization': 'Bearer SEU_TOKEN_AQUI'
        },
        body: JSON.stringify(estabelecimento)
      });
      
      if (response.status === 401) {
        console.log('❌ Erro: Autenticação necessária para criar estabelecimentos');
        console.log('   Faça login como admin primeiro');
        break;
      }
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Criado: ${estabelecimento.nome} (ID: ${data.data._id})`);
      } else {
        console.log(`❌ Erro ao criar ${estabelecimento.nome}:`, data.message);
      }
    } catch (error) {
      console.log(`❌ Erro na requisição para ${estabelecimento.nome}:`, error.message);
    }
  }
}

async function testRead() {
  console.log('\n📖 Testando READ...');
  
  try {
    // Listar todos
    const response = await fetch(`${API_BASE}/estabelecimentos`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Lista todos: ${data.count} estabelecimentos encontrados`);
      if (data.data.length > 0) {
        console.log('   Primeiro estabelecimento:', data.data[0].nome);
      }
    } else {
      console.log('❌ Erro ao listar:', data.message);
    }
    
    // Buscar por tipo
    const responseTipo = await fetch(`${API_BASE}/estabelecimentos/tipo/Restaurante`);
    const dataTipo = await responseTipo.json();
    
    if (responseTipo.ok) {
      console.log(`✅ Busca por tipo: ${dataTipo.count} restaurantes encontrados`);
    } else {
      console.log('❌ Erro ao buscar por tipo:', dataTipo.message);
    }
    
    // Buscar por proximidade
    const responseProximos = await fetch(`${API_BASE}/estabelecimentos/proximos?lat=-6.89&lng=-38.56&raio=5`);
    const dataProximos = await responseProximos.json();
    
    if (responseProximos.ok) {
      console.log(`✅ Busca por proximidade: ${dataProximos.count} estabelecimentos próximos`);
    } else {
      console.log('❌ Erro ao buscar por proximidade:', dataProximos.message);
    }
    
  } catch (error) {
    console.log('❌ Erro nas requisições de leitura:', error.message);
  }
}

async function testUpdate() {
  console.log('\n✏️ Testando UPDATE...');
  
  try {
    // Primeiro, vamos listar para pegar um ID
    const response = await fetch(`${API_BASE}/estabelecimentos`);
    const data = await response.json();
    
    if (response.ok && data.data.length > 0) {
      const estabelecimento = data.data[0];
      const updateData = {
        descricao: `${estabelecimento.descricao} - ATUALIZADO EM ${new Date().toLocaleString()}`
      };
      
      const updateResponse = await fetch(`${API_BASE}/estabelecimentos/${estabelecimento._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer SEU_TOKEN_AQUI'
        },
        body: JSON.stringify(updateData)
      });
      
      if (updateResponse.status === 401) {
        console.log('❌ Erro: Autenticação necessária para atualizar estabelecimentos');
        console.log('   Faça login como admin primeiro');
        return;
      }
      
      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log(`✅ Atualizado: ${estabelecimento.nome}`);
      } else {
        console.log(`❌ Erro ao atualizar:`, updateResult.message);
      }
    } else {
      console.log('❌ Nenhum estabelecimento encontrado para atualizar');
    }
  } catch (error) {
    console.log('❌ Erro na atualização:', error.message);
  }
}

async function testDelete() {
  console.log('\n🗑️ Testando DELETE...');
  
  try {
    // Primeiro, vamos listar para pegar um ID
    const response = await fetch(`${API_BASE}/estabelecimentos`);
    const data = await response.json();
    
    if (response.ok && data.data.length > 0) {
      const estabelecimento = data.data[0];
      
      const deleteResponse = await fetch(`${API_BASE}/estabelecimentos/${estabelecimento._id}`, {
        method: 'DELETE',
        headers: {
          // 'Authorization': 'Bearer SEU_TOKEN_AQUI'
        }
      });
      
      if (deleteResponse.status === 401) {
        console.log('❌ Erro: Autenticação necessária para deletar estabelecimentos');
        console.log('   Faça login como admin primeiro');
        return;
      }
      
      const deleteResult = await deleteResponse.json();
      
      if (deleteResponse.ok) {
        console.log(`✅ Deletado: ${estabelecimento.nome}`);
      } else {
        console.log(`❌ Erro ao deletar:`, deleteResult.message);
      }
    } else {
      console.log('❌ Nenhum estabelecimento encontrado para deletar');
    }
  } catch (error) {
    console.log('❌ Erro na deleção:', error.message);
  }
}

// Função principal
async function runTests() {
  console.log('🚀 Iniciando testes CRUD para Estabelecimentos Comerciais');
  console.log('=' .repeat(60));
  
  await testCreate();
  await testRead();
  await testUpdate();
  await testDelete();
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Testes concluídos!');
  console.log('\n📝 Notas:');
  console.log('   - Para operações CREATE, UPDATE e DELETE, é necessário estar logado como admin');
  console.log('   - As operações READ são públicas e funcionam sem autenticação');
  console.log('   - Use o endpoint /api/auth/login para fazer login primeiro');
}

// Executar testes se o script for chamado diretamente
if (typeof window === 'undefined') {
  // Node.js environment - usar import dinâmico
  const { default: fetch } = await import('node-fetch');
  runTests().catch(console.error);
} else {
  // Browser environment
  console.log('🌐 Execute este script no Node.js para testar a API');
  console.log('   node scripts/test-crud.js');
}
