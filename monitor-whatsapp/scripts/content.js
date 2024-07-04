"use strict";

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', monitor);
} else {
    monitor();
}

const conversas = {
    nome: '',
    mensagens: []
};

const SPAN_CLASS = '_amig';
const SPAN_MSG_TEXT = 'x3psx0u';
const SPAN_MSG_TEXT_SPAN = '_ao3e';

const spanElement = document.getElementsByClassName(SPAN_CLASS);
const spanElement_text = document.getElementsByClassName(SPAN_MSG_TEXT_SPAN);

const amigos = [];
const msg = [];

function monitor() {
    const callback = function (mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'subtree') {
                try {
                    // amigos.push(spanElement[0].outerText);
                    // msg.push(spanElement_text);
                    // const conjunto = new Set(nome);
                    // const arraySemRepeticao = Array.from(conjunto);
                    let texto = spanElement_text;

                    console.log(texto);

                } catch (error) {
                    return error;
                }
            }
        }
    };

    // Cria um novo observer com a função de callback
    const observer = new MutationObserver(callback);

    // Configura o observer para observar alterações no DOM
    observer.observe(document.body, { subtree: true, childList: true });
}
