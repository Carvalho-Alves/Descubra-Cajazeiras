// Script para criar dados de exemplo para estabelecimentos comerciais
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
  },
  {
    nome: "Farmácia Popular",
    tipo: "Farmácia",
    categoria: "Farmácia e Drogaria",
    descricao: "Farmácia com preços populares, atendimento 24 horas e entrega a domicílio.",
    endereco: {
      rua: "Rua João Pessoa",
      numero: "789",
      bairro: "João Pessoa",
      cep: "58900-000"
    },
    localizacao: {
      latitude: -6.91,
      longitude: -38.58
    },
    contato: {
      telefone: "(83) 3531-9012",
      whatsapp: "(83) 99999-9012",
      instagram: "@farmaciapopular"
    },
    horario_funcionamento: {
      segunda: { abertura: "00:00", fechamento: "23:59", fechado: false },
      terca: { abertura: "00:00", fechamento: "23:59", fechado: false },
      quarta: { abertura: "00:00", fechamento: "23:59", fechado: false },
      quinta: { abertura: "00:00", fechamento: "23:59", fechado: false },
      sexta: { abertura: "00:00", fechamento: "23:59", fechado: false },
      sabado: { abertura: "00:00", fechamento: "23:59", fechado: false },
      domingo: { abertura: "00:00", fechamento: "23:59", fechado: false }
    },
    servicos: ["Atendimento 24h", "Entrega a domicílio", "Consulta farmacêutica"],
    pagamentos: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX"],
    imagens: ["https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800"],
    status: "ativo"
  },
  {
    nome: "Supermercado Cajazeiras",
    tipo: "Supermercado",
    categoria: "Supermercado",
    descricao: "Supermercado completo com variedade de produtos, preços baixos e atendimento de qualidade.",
    endereco: {
      rua: "Avenida Padre Rolim",
      numero: "321",
      bairro: "Padre Rolim",
      cep: "58900-000"
    },
    localizacao: {
      latitude: -6.85,
      longitude: -38.52
    },
    contato: {
      telefone: "(83) 3531-3456",
      whatsapp: "(83) 99999-3456",
      instagram: "@supercajazeiras",
      facebook: "https://facebook.com/supercajazeiras"
    },
    horario_funcionamento: {
      segunda: { abertura: "07:00", fechamento: "22:00", fechado: false },
      terca: { abertura: "07:00", fechamento: "22:00", fechado: false },
      quarta: { abertura: "07:00", fechamento: "22:00", fechado: false },
      quinta: { abertura: "07:00", fechamento: "22:00", fechado: false },
      sexta: { abertura: "07:00", fechamento: "22:00", fechado: false },
      sabado: { abertura: "07:00", fechamento: "22:00", fechado: false },
      domingo: { abertura: "07:00", fechamento: "20:00", fechado: false }
    },
    servicos: ["Estacionamento", "Wi-Fi", "Caixa rápido", "Entrega a domicílio"],
    pagamentos: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Vale Refeição"],
    imagens: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
    status: "ativo"
  },
  {
    nome: "Loja de Roupas Moda Jovem",
    tipo: "Loja",
    categoria: "Vestuário",
    descricao: "Loja especializada em roupas para jovens, com as últimas tendências e preços acessíveis.",
    endereco: {
      rua: "Rua da Paz",
      numero: "654",
      bairro: "Centro",
      cep: "58900-000"
    },
    localizacao: {
      latitude: -6.88,
      longitude: -38.55
    },
    contato: {
      telefone: "(83) 3531-7890",
      whatsapp: "(83) 99999-7890",
      instagram: "@modajovem",
      facebook: "https://facebook.com/modajovem"
    },
    horario_funcionamento: {
      segunda: { abertura: "09:00", fechamento: "18:00", fechado: false },
      terca: { abertura: "09:00", fechamento: "18:00", fechado: false },
      quarta: { abertura: "09:00", fechamento: "18:00", fechado: false },
      quarta: { abertura: "09:00", fechamento: "18:00", fechado: false },
      quinta: { abertura: "09:00", fechamento: "18:00", fechado: false },
      sexta: { abertura: "09:00", fechamento: "18:00", fechado: false },
      sabado: { abertura: "09:00", fechamento: "17:00", fechado: false },
      domingo: { abertura: "00:00", fechamento: "00:00", fechado: true }
    },
    servicos: ["Prova de roupas", "Alterações", "Cartão fidelidade"],
    pagamentos: ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX"],
    imagens: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"],
    status: "ativo"
  }
];

console.log("Dados de exemplo para estabelecimentos comerciais:");
console.log(JSON.stringify(sampleEstabelecimentos, null, 2));

// Para usar com a API, você pode fazer POST requests para /api/estabelecimentos
// Exemplo de uso com curl:
console.log("\nPara criar um estabelecimento, use:");
console.log("curl -X POST http://localhost:3333/api/estabelecimentos \\");
console.log("  -H 'Content-Type: application/json' \\");
console.log("  -H 'Authorization: Bearer SEU_TOKEN_AQUI' \\");
console.log("  -d 'JSON_DO_ESTABELECIMENTO'");
