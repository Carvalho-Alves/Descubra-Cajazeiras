// scripts/models/Estabelecimento.js

class Estabelecimento {
    constructor(data) {
        this._id = data._id;
        this.nome = data.nome;
        this.tipo = data.tipo;
        this.categoria = data.categoria;
        this.descricao = data.descricao;
        this.endereco = data.endereco;
        this.localizacao = data.localizacao;
        this.contato = data.contato;
        this.horario_funcionamento = data.horario_funcionamento;
        this.servicos = data.servicos || [];
        this.pagamentos = data.pagamentos || [];
        this.imagens = data.imagens || [];
        this.status = data.status;
        this.usuario = data.usuario;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    getLatLng() {
        // Retorna as coordenadas no formato [latitude, longitude] para o Leaflet
        return [this.localizacao.latitude, this.localizacao.longitude];
    }

    getEnderecoCompleto() {
        const { rua, numero, bairro, cep } = this.endereco;
        return `${rua}, ${numero} - ${bairro}, CEP: ${cep}`;
    }

    getHorarioFormatado(dia) {
        const horario = this.horario_funcionamento[dia];
        if (!horario || horario.fechado) {
            return 'Fechado';
        }
        return `${horario.abertura} - ${horario.fechamento}`;
    }

    getServicosFormatados() {
        return this.servicos.join(', ') || 'Não informado';
    }

    getPagamentosFormatados() {
        return this.pagamentos.join(', ') || 'Não informado';
    }

    getContatoFormatado() {
        const contatos = [];
        if (this.contato.telefone) contatos.push(`📞 ${this.contato.telefone}`);
        if (this.contato.whatsapp) contatos.push(`📱 ${this.contato.whatsapp}`);
        if (this.contato.instagram) contatos.push(`📷 @${this.contato.instagram}`);
        if (this.contato.facebook) contatos.push(`📘 ${this.contato.facebook}`);
        if (this.contato.site) contatos.push(`🌐 ${this.contato.site}`);
        
        return contatos.length > 0 ? contatos.join('\n') : 'Não informado';
    }

    getStatusColor() {
        switch (this.status) {
            case 'ativo':
                return 'success';
            case 'inativo':
                return 'danger';
            case 'temporariamente_fechado':
                return 'warning';
            default:
                return 'secondary';
        }
    }

    getStatusText() {
        switch (this.status) {
            case 'ativo':
                return 'Aberto';
            case 'inativo':
                return 'Fechado';
            case 'temporariamente_fechado':
                return 'Temporariamente Fechado';
            default:
                return 'Desconhecido';
        }
    }

    getTipoIcon() {
        switch (this.tipo) {
            case 'Restaurante':
                return 'fas fa-utensils';
            case 'Bar':
                return 'fas fa-glass-martini-alt';
            case 'Loja':
                return 'fas fa-shopping-bag';
            case 'Farmácia':
                return 'fas fa-pills';
            case 'Supermercado':
                return 'fas fa-shopping-cart';
            default:
                return 'fas fa-store';
        }
    }

    validate() {
        const errors = [];
        
        if (!this.nome || this.nome.trim() === '') {
            errors.push('O nome do estabelecimento é obrigatório.');
        }
        
        if (!this.tipo || this.tipo.trim() === '') {
            errors.push('O tipo do estabelecimento é obrigatório.');
        }
        
        if (!this.categoria || this.categoria.trim() === '') {
            errors.push('A categoria é obrigatória.');
        }
        
        if (!this.descricao || this.descricao.trim() === '') {
            errors.push('A descrição é obrigatória.');
        }
        
        if (!this.endereco || !this.endereco.rua || !this.endereco.numero || !this.endereco.bairro || !this.endereco.cep) {
            errors.push('O endereço completo é obrigatório.');
        }
        
        if (!this.localizacao || !this.localizacao.latitude || !this.localizacao.longitude) {
            errors.push('As coordenadas de localização são obrigatórias.');
        }
        
        if (!this.contato || !this.contato.telefone) {
            errors.push('O telefone de contato é obrigatório.');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    toJSON() {
        return {
            _id: this._id,
            nome: this.nome,
            tipo: this.tipo,
            categoria: this.categoria,
            descricao: this.descricao,
            endereco: this.endereco,
            localizacao: this.localizacao,
            contato: this.contato,
            horario_funcionamento: this.horario_funcionamento,
            servicos: this.servicos,
            pagamentos: this.pagamentos,
            imagens: this.imagens,
            status: this.status,
            usuario: this.usuario,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(data) {
        return new Estabelecimento(data);
    }
}

export default Estabelecimento;
