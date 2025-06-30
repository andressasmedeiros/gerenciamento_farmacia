class StringUtils {
    static isValidCpf(cpf) {
        cpf = cpf.replace(/\D/g, "");

        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        let soma = 0, resto;

        for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf[9])) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf[10])) return false;

        return true;
    }

    static isValidCnpj(cnpj) {
        cnpj = cnpj.replace(/\D/g, "");

        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += parseInt(numeros[tamanho - i]) * pos--;
            if (pos < 2) pos = 9;
        }
        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos[0])) return false;

        tamanho += 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += parseInt(numeros[tamanho - i]) * pos--;
            if (pos < 2) pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos[1])) return false;

        return true;
    }

    static formatCpf(value) {
        return value
            .replace(/\D/g, '')
            .slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    static formatCnpj(value) {
        return value
            .replace(/\D/g, '')
            .slice(0, 14)
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }

    static formatCep(cep) {
        return cep
            .replace(/\D/g, "")
            .replace(/^(\d{5})(\d)/, "$1-$2")
            .slice(0, 9);
    }

    static isValidCep(cep) {
        return /^\d{5}-\d{3}$/.test(cep);
    }

    static formatDateTime(date) {
        if (!date) {
            return '';
        }
        let d = typeof date === 'string' ? new Date(date) : date;

        const formatNumber = (num) => String(num).padStart(2, '0');

        return `${formatNumber(d.getDate())}/${formatNumber(d.getMonth() + 1)}/${d.getFullYear()} ` +
            `${formatNumber(d.getHours())}:${formatNumber(d.getMinutes())}:${formatNumber(d.getSeconds())}`;
    }
}

export default StringUtils;
