function campo(id, valor){
    return id + String(valor.length).padStart(2, '0') + valor;
}

// Dígito verificador exigido pelo padrão do Pix (CRC16)
function crc16(texto){
    let crc = 0xFFFF;
    for (let i = 0; i < texto.length; i++){
        crc ^= texto.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++){
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Pix aceita só letras e números sem acento, em maiúsculo
function limpar(texto, max){
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Za-z0-9 ]/g, '')
        .toUpperCase()
        .slice(0, max)
        .trim();
}

// CPF e CNPJ entram só com números
function normalizarChave(chave){
    const c = chave.trim();
    const ehCpf = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(c);
    const ehCnpj = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(c);
    return ehCpf || ehCnpj ? c.replace(/\D/g, '') : c;
}

export function gerarPix({ chave, nome, cidade = 'SAO SEBASTIAO' }){
    const conta = campo('00', 'br.gov.bcb.pix') + campo('01', normalizarChave(chave));

    const semCrc =
        campo('00', '01') +
        campo('26', conta) +
        campo('52', '0000') +
        campo('53', '986') +
        campo('58', 'BR') +
        campo('59', limpar(nome, 25) || 'DOACAO') +
        campo('60', limpar(cidade, 15)) +
        campo('62', campo('05', '***')) +
        '6304';

    return semCrc + crc16(semCrc);
}