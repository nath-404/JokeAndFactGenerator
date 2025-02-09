// for joke card
const jokeCard = document.querySelector('.joke');
const jokeButton = document.querySelector('#generate-joke-btn');
const jokeReveal = document.querySelector('.reveal-joke');
const copyJokeButton = document.querySelector('#copy-joke');

// for fact card
const factCard = document.querySelector('.fact');
const factButton = document.querySelector('#generate-fact-btn');
const factReveal = document.querySelector('.reveal-fact');
const copyFactButton = document.querySelector('#copy-fact');

const elements = {
    joke: {
        card: jokeCard,
        reveal: jokeReveal,
        button: jokeButton,
        copy: copyJokeButton,
        fetchFunction: createJoke,
        controller: null
    },
    fact: {
        card: factCard,
        reveal: factReveal,
        button: factButton,
        copy: copyFactButton,
        fetchFunction: createFact,
        controller: null
    }
};

async function generate(type) {
    const { card, reveal, button, copy, fetchFunction } = elements[type];

    if (elements[type].controller) {
        elements[type].controller.abort();
    }

    const controller = new AbortController();
    elements[type].controller = controller;

    card.classList.add('expanded');
    reveal.style.display = 'flex';
    button.innerHTML = 'Generate Another';
    button.style.pointerEvents = 'none';
    copy.style.display = 'none';

    await fetchFunction(controller.signal);

    button.style.pointerEvents = 'auto';
    copy.style.display = 'block';
}

const jokeBox = document.querySelector('.joke-box');
const jokeAPI = 'https://v2.jokeapi.dev/joke/Any';
async function createJoke(signal) {
    try {
        const res = await fetch(jokeAPI, { signal });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        
        const data = await res.json();
        jokeBox.innerHTML = "";

        if (data.type === 'twopart') {
            for (let i = 0; i < data.setup.length; i++) {
                if (signal.aborted) return;
                await new Promise(resolve => setTimeout(resolve, 25));
                jokeBox.innerHTML += data.setup[i];
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            jokeBox.innerHTML += '<br><br>';
            for (let i = 0; i < data.delivery.length; i++) {
                if (signal.aborted) return;
                await new Promise(resolve => setTimeout(resolve, 25));
                jokeBox.innerHTML += data.delivery[i];
            }
        } else {
            for (let i = 0; i < data.joke.length; i++) {
                if (signal.aborted) return;
                await new Promise(resolve => setTimeout(resolve, 25));
                jokeBox.innerHTML += data.joke[i];
            }
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.log('Error fetching joke:', error);
            alert('Failed to load a joke. Please try again later.');
        }
    }
}

const factBox = document.querySelector('.fact-box');
const factAPI = 'https://uselessfacts.jsph.pl/random.json';
async function createFact(signal) {
    try {
        const res = await fetch(factAPI, { signal });
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        
        const data = await res.json();
        factBox.innerHTML = "";

        await new Promise(resolve => setTimeout(resolve, 1000));
        for (let i = 0; i < data.text.length; i++) {
            if (signal.aborted) return;
            factBox.innerHTML += data.text[i];
            await new Promise(resolve => setTimeout(resolve, 25));
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.log('Error fetching fact:', error);
            alert('Failed to load a fact. Please try again later.');
        }
    }
}

async function copy(type) {
    let target;
    if (type === 'joke') {
        target = jokeBox;
    } else if (type === 'fact') {
        target = factBox;
    }
    let text = target.innerHTML.replace(/<br\s*\/?>/g, '\n');
    navigator.clipboard.writeText(text)
        .then(() => {
            showCopyNotification();
        })
        .catch(err => {
            console.error('Failed to copy.')
        })
}

function showCopyNotification() {
    const notification = document.createElement('div');
    notification.textContent = 'Text copied';
    notification.classList.add('copy-notification');

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 1500);
}

let mode = 1; // 1 for light, 0 for dark
const modeToggle = document.querySelector('#mode');
const body = document.querySelector('body');
const copyButton = document.getElementsByClassName('copy-icon');
modeToggle.addEventListener('click', () => {
    if (mode === 1) {
        mode = 0;
        modeToggle.src = 'mode2.png';
        body.style.color = 'white';
        body.style.backgroundColor = '#171717';
        for (const button of copyButton) {
            button.src = 'copy2.png';
        }
    } else if (mode === 0) {
        mode = 1;
        modeToggle.src = 'mode.png';
        body.style.color = 'black';
        body.style.backgroundColor = 'white';
        for (const button of copyButton) {
            button.src = 'copy.png';
        }
    }
})