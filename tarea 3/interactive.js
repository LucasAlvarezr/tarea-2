// Obtener referencias a los elementos
const redInput = document.getElementById("red");
const greenInput = document.getElementById("green");
const blueInput = document.getElementById("blue");
const colorDisplay = document.getElementById("color-display");
const colorBoxes = document.querySelectorAll(".color-box");

// Función para actualizar el color del rectángulo con las barras
function updateColor() {
  const red = redInput.value;
  const green = greenInput.value;
  const blue = blueInput.value;

  const rgbColor = `rgb(${red}, ${green}, ${blue})`;
  colorDisplay.style.backgroundColor = rgbColor;
}

// Función para cambiar el color al hacer clic en un color básico
function selectColor(event) {
  const selectedColor = event.target.getAttribute("data-color");
  colorDisplay.style.backgroundColor = selectedColor;
}

// Añadir eventos a las barras deslizantes
redInput.addEventListener("input", updateColor);
greenInput.addEventListener("input", updateColor);
blueInput.addEventListener("input", updateColor);

// Añadir eventos a los rectángulos de colores
colorBoxes.forEach(box => {
  box.addEventListener("click", selectColor);
});
