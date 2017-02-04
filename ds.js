var gif = document.getElementById('gif')

gif.style.display = 'none'

document.getElementById('main').addEventListener('click', ch)

function ch() {
	console.log('click handled')
	gif.style.display = ''
}