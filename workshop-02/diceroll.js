/** @type {HTMLElement} */ const balanceEl = document.getElementById('balance')
/** @type {HTMLInputElement} */ const betEl = document.getElementById('bet')
/** @type {HTMLButtonElement} */ const decreaseBetEl = document.querySelector('.decreaseBet')
/** @type {HTMLButtonElement} */ const increaseBetEl = document.querySelector('.increaseBet')

/** @type {HTMLElement} */ const yourBetEl = document.querySelector('[data-your-bet]')
/** @type {HTMLElement} */ const totalDiceEl = document.querySelector('[data-total]')
/** @type {NodeListOf<HTMLSpanElement>} */ const dicesEl = document.querySelectorAll('[data-dice]')
/** @type {HTMLDivElement} */ const gameEl = document.querySelector('.dicebet')

const diceMap = {
    1: '\u2680',
    2: '\u2681',
    3: '\u2682',
    4: '\u2683',
    5: '\u2684',
    6: '\u2685',
}
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    trailingZeroDisplay: 'stripIfInteger',
    signDisplay: 'exceptZero'
})

betEl.addEventListener('change', setBet)
decreaseBetEl.addEventListener('click', () => { betEl.value = parseInt(betEl.value) - 5; setBet() })
increaseBetEl.addEventListener('click', () => { betEl.value = parseInt(betEl.value) + 5; setBet() })

function setBet(event) {
    let betValue = parseInt(betEl.value)
    const balanceValue = parseInt(balanceEl.dataset.value)
    if (betValue < 1) betValue = 1
    if (betValue > balanceValue) betValue = balanceValue
    betEl.value = betValue
    betEl.style.width = (betEl.value.toString().length || 1) + 'ch'
}
function autoWidth(event) {
    betEl.style.width = (betEl.value.toString().length || 1) + 'ch'
}
function invalidBet(event) {
    if (parseInt(balanceEl.dataset.value) === 0)
        event.target.setCustomValidity('You have gone broke!')
    else 
        event.target.setCustomValidity('Enter your bet!')
}

async function onBet(/** @type {SubmitEvent} */ event) {
    event.preventDefault()
    /** @type {HTMLButtonElement} */const submitter = event.submitter
    dicesEl.forEach((el) => {
        el.textContent = ''
        el.classList.remove('rolled')
        el.style.rotate = ((Math.floor((Math.random() / 0.125)) - 3) * 90) + 'deg'
        setTimeout(() => el.classList.add('rolled'), 0)
    })
    totalDiceEl.textContent = ''
    new Audio("./diceroll.mp3").play()

    setBet(event)

    if (parseInt(balanceEl.dataset.value) === 0) {
        balanceEl.closest('h2').style.animation = 'shake-horizontal 0.2s ease'
        return;
    }

    const value = submitter.value
    const dices = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
    ]
    const sum = dices.reduce((sum, dice) => sum += dice, 0)
    let multiplier = -1
    if (value === 'low' && sum < 11) {
        multiplier = 1
    } else if (value === 'mid' && sum === 11) {
        multiplier = 5
    } else if (value === 'high' && sum > 11) {
        multiplier = 1
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        trailingZeroDisplay: 'stripIfInteger',
        signDisplay: 'exceptZero'
    })

    yourBetEl.textContent = value.toUpperCase()
    yourBetEl.dataset.yourBet = value
    const result = betEl.value * multiplier
    const balance = parseInt(balanceEl.dataset.value)
    const resultName = sum === 11 ? 'MID'
        : sum > 11 ? 'HIGH'
        : sum < 11 ? 'LOW'
        : ''
    dicesEl.forEach((el, i) => el.textContent = diceMap[dices[i]])
    console.log(balance, result)
    balanceEl.dataset.value = balance + result
    gameEl.classList.remove('gain', 'loss')
    
    await new Promise(res => setTimeout(res, 300))
    
    const resultEl = document.createElement('span')
    const resultClass = result > 0 ? 'gain' : result < 0 ? 'loss' : ''

    gameEl.classList.add(resultClass)
    totalDiceEl.textContent = `(${sum} - ${resultName})`
    resultEl.classList.add(resultClass, 'result')
    resultEl.textContent = formatter.format(result)
    resultEl.style.rotate = (Math.floor(Math.random() * 12) - 6) + 'deg'
    setTimeout(() => resultEl.remove(), 1000)

    balanceEl.parentElement.append(resultEl)
    balanceEl.textContent = balanceEl.dataset.value
}
