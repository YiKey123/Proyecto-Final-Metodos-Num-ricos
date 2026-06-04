// Variables globales para gráficos para poder destruirlos al recalcular
let chartReservas = null;
let chartPrecios = null;

// ==========================================
// ESCENARIO A: Sistemas de Ecuaciones (Gauss-Seidel)
// ==========================================
function resolverSistema() {
    const strMatriz = document.getElementById('matrizA').value;
    const strVector = document.getElementById('vectorB').value;
    
    // Parseo básico (en un caso real, requiere validaciones exhaustivas)
    const b = strVector.split(',').map(Number);
    const flatA = strMatriz.split(',').map(Number);
    const n = b.length;
    let A = [];
    for(let i=0; i<n; i++) A.push(flatA.slice(i*n, (i+1)*n));

    let x = new Array(n).fill(0);
    const iteracionesMax = 50;
    const tolerancia = 0.001;

    for (let iter = 0; iter < iteracionesMax; iter++) {
        let maxError = 0;
        for (let i = 0; i < n; i++) {
            let suma = 0;
            for (let j = 0; j < n; j++) {
                if (j !== i) suma += A[i][j] * x[j];
            }
            let xNuevo = (b[i] - suma) / A[i][i];
            maxError = Math.max(maxError, Math.abs(xNuevo - x[i]));
            x[i] = xNuevo;
        }
        if (maxError < tolerancia) break;
    }

    let resultadoHTML = "<strong>Cantidades a enviar:</strong><ul>";
    x.forEach((val, index) => {
        resultadoHTML += `<li>Zona ${index + 1}: ${val.toFixed(2)} unidades</li>`;
    });
    resultadoHTML += "</ul>";
    document.getElementById('resultadoSistemas').innerHTML = resultadoHTML;
}

// ==========================================
// ESCENARIO B: Ecuaciones Diferenciales (Euler)
// R'(t) = entrada - consumo
// ==========================================
function simularReservas() {
    let R = parseFloat(document.getElementById('reservaInicial').value);
    const entrada = parseFloat(document.getElementById('entradaD').value);
    const consumo = parseFloat(document.getElementById('consumoD').value);
    
    let tiempo = [];
    let reservas = [];
    const h = 1; // Paso de 1 día
    let t = 0;

    // Ejecutar hasta que la reserva llegue a 0 o pasen 30 días
    while (R > 0 && t <= 30) {
        tiempo.push(t);
        reservas.push(R);
        // Método de Euler: y(i+1) = y(i) + h * f(t, y)
        let derivada = entrada - consumo;
        R = R + h * derivada;
        t += h;
    }

    graficarReservas(tiempo, reservas);
}

function graficarReservas(labels, data) {
    const ctx = document.getElementById('graficoReservas').getContext('2d');
    if (chartReservas) chartReservas.destroy();
    
    chartReservas = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nivel de Reservas',
                data: data,
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: { x: { title: { display: true, text: 'Días' } }, y: { title: { display: true, text: 'Litros / Unidades' } } }
        }
    });
}

// ==========================================
// ESCENARIO C y D: Interpolación (Lagrange) e Integración (Trapecio)
// ==========================================
function analizarPrecios() {
    const xDatos = document.getElementById('diasDatos').value.split(',').map(Number);
    const yDatos = document.getElementById('preciosDatos').value.split(',').map(Number);
    
    let diasInterpolados = [];
    let preciosInterpolados = [];
    
    // Función de Lagrange
    const lagrange = (x, xArr, yArr) => {
        let suma = 0;
        for (let i = 0; i < xArr.length; i++) {
            let producto = yArr[i];
            for (let j = 0; j < xArr.length; j++) {
                if (i !== j) {
                    producto *= (x - xArr[j]) / (xArr[i] - xArr[j]);
                }
            }
            suma += producto;
        }
        return suma;
    };

    // Generar curva diaria para 30 días
    for (let i = 1; i <= 30; i++) {
        diasInterpolados.push(i);
        preciosInterpolados.push(lagrange(i, xDatos, yDatos));
    }

    graficarPrecios(diasInterpolados, preciosInterpolados, xDatos, yDatos);

    // Integración: Regla del Trapecio para costo acumulado
    let costoTotal = 0;
    const h = 1; // 1 día
    for (let i = 0; i < preciosInterpolados.length - 1; i++) {
        costoTotal += (h / 2) * (preciosInterpolados[i] + preciosInterpolados[i+1]);
    }

    document.getElementById('resultadoIntegracion').innerText = `Gasto Total Mensual Acumulado: ${costoTotal.toFixed(2)} Bs`;
}

function graficarPrecios(dias, precios, diasOrig, preciosOrig) {
    const ctx = document.getElementById('graficoPrecios').getContext('2d');
    if (chartPrecios) chartPrecios.destroy();

    // Dataset original (puntos dispersos) formatedo para Chart.js scatter
    const puntosOriginales = diasOrig.map((dia, index) => ({x: dia, y: preciosOrig[index]}));

    chartPrecios = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dias,
            datasets: [
                {
                    label: 'Curva de Precios (Interpolada)',
                    data: precios,
                    borderColor: 'blue',
                    tension: 0.4
                },
                {
                    type: 'scatter',
                    label: 'Datos Reales',
                    data: puntosOriginales,
                    backgroundColor: 'black',
                    pointRadius: 6
                }
            ]
        }
    });
}

// ==========================================
// ESCENARIO E: Raíces (Bisección)
// ==========================================
function calcularRaiz() {
    // Función simplificada: f(t) = CostoAcumulado(t) - Ingreso
    // Simularemos una función donde el costo crece cuadráticamente con el tiempo
    // f(t) = 5*t^2 + 10*t - 4000 (Asumiendo un ingreso fijo de 4000 Bs)
    
    const f = (t) => (5 * Math.pow(t, 2) + 10 * t) - 4000;
    
    let a = 1;  // Día 1
    let b = 30; // Día 30
    let c = 0;
    const tol = 0.01;

    if (f(a) * f(b) >= 0) {
        document.getElementById('resultadoRaiz').innerText = "La raíz no está en el intervalo o el ingreso cubre todo el mes.";
        return;
    }

    while ((b - a) / 2 > tol) {
        c = (a + b) / 2;
        if (f(c) === 0) break;
        else if (f(a) * f(c) < 0) b = c;
        else a = c;
    }

    document.getElementById('resultadoRaiz').innerText = `El día crítico donde el costo supera al ingreso familiar es aproximadamente el Día ${c.toFixed(1)}`;
}
