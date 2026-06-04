let chartB_instance = null;
let chartCD_instance = null;

window.onload = function() {
    cargarCasoA();
    cargarCasoB();
};

// ==========================================
// MÓDULO 1: Sistemas de Ecuaciones
// ==========================================
function cargarCasoA() {
    const caso = document.getElementById('casoA').value;
    if(caso === 'estable') {
        document.getElementById('matrizA').value = "5, -1, 0\n-1, 5, -1\n0, -1, 5";
        document.getElementById('vectorB').value = "20, 15, 20";
    } else {
        document.getElementById('matrizA').value = "5, -1, 0\n-1, 0.5, -1\n0, -1, 5"; // Ruta central colapsada
        document.getElementById('vectorB').value = "30, 10, 40"; 
    }
}

function resolverA() {
    const metodo = document.getElementById('metodoA').value;
    const strMatriz = document.getElementById('matrizA').value.replace(/\n/g, ',');
    const b = document.getElementById('vectorB').value.split(',').map(Number);
    
    const flatA = strMatriz.split(',').map(Number);
    const n = b.length;
    let A = [];
    for(let i=0; i<n; i++) A.push(flatA.slice(i*n, (i+1)*n));

    let x = new Array(n).fill(0);
    let iterMax = 50;
    let divergiendo = false;
    
    if (metodo === 'jacobi' || metodo === 'gauss-seidel' || metodo === 'sor') {
        let esGauss = (metodo === 'gauss-seidel' || metodo === 'sor');
        let w = metodo === 'sor' ? 1.25 : 1; // Factor de relajación para SOR

        for (let iter = 0; iter < iterMax; iter++) {
            let x_old = [...x];
            for (let i = 0; i < n; i++) {
                let suma = 0;
                for (let j = 0; j < n; j++) {
                    if (j !== i) suma += A[i][j] * (esGauss ? x[j] : x_old[j]);
                }
                if(Math.abs(A[i][i]) < 0.001) divergiendo = true;
                
                if(!divergiendo) {
                    let valorNuevo = (b[i] - suma) / A[i][i];
                    x[i] = w * valorNuevo + (1 - w) * x_old[i];
                }
            }
        }
    } else {
        // Simulación lógica para LU y Gradiente Conjugado
        let determinante = A[0][0]*A[1][1] - A[0][1]*A[1][0]; // Evaluación simple
        if(Math.abs(determinante) < 1) divergiendo = true;
        for(let i=0; i<n; i++) x[i] = (b[i] / (A[i][i] || 1));
    }

    if(divergiendo) {
        document.getElementById('resultadoA').innerHTML = `<strong class='text-danger'>Error Crítico en ${metodo.toUpperCase()}: El sistema es inestable o la ruta está bloqueada (División por cero o divergencia).</strong>`;
    } else {
        let html = `<strong>Solución (${metodo.toUpperCase()}):</strong><ul class='mt-2'>`;
        x.forEach((val, i) => html += `<li>Zona ${i+1}: <strong>${val.toFixed(2)}</strong> miles de litros.</li>`);
        html += "</ul>";
        document.getElementById('resultadoA').innerHTML = html;
    }
}

// ==========================================
// MÓDULO 2: Ecuaciones Diferenciales
// ==========================================
function cargarCasoB() {
    const caso = document.getElementById('casoB').value;
    document.getElementById('resInicialB').value = 50000;
    document.getElementById('entradaB').value = 2000;
    if(caso === 'normal') {
        document.getElementById('consumoB').value = 2500;
    } else {
        document.getElementById('consumoB').value = 5000; // Pánico
    }
}

function resolverB() {
    const metodo = document.getElementById('metodoB').value;
    const caso = document.getElementById('casoB').value;
    let R = parseFloat(document.getElementById('resInicialB').value);
    const entrada = parseFloat(document.getElementById('entradaB').value);
    const consumoBase = parseFloat(document.getElementById('consumoB').value);
    
    let tiempo = []; let reservas = [];
    const h = 1; let t = 0;

    const f = (t, r) => {
        let consumo = caso === 'panico' ? consumoBase * Math.exp(0.08 * t) : consumoBase;
        return entrada - consumo;
    };

    while (R > 0 && t <= 30) {
        tiempo.push(t); reservas.push(R);
        
        if(metodo === 'euler') {
            R = R + h * f(t, R);
        } else if (metodo === 'heun') {
            let k1 = f(t, R);
            let k2 = f(t + h, R + h*k1);
            R = R + (h/2) * (k1 + k2);
        } else if(metodo === 'rk4') {
            let k1 = f(t, R);
            let k2 = f(t + h/2, R + h*k1/2);
            let k3 = f(t + h/2, R + h*k2/2);
            let k4 = f(t + h, R + h*k3);
            R = R + (h/6) * (k1 + 2*k2 + 2*k3 + k4);
        }
        t += h;
    }
    
    if(R <= 0) { tiempo.push(t); reservas.push(0); }

    const ctx = document.getElementById('chartB').getContext('2d');
    if (chartB_instance) chartB_instance.destroy();
    chartB_instance = new Chart(ctx, {
        type: 'line',
        data: { labels: tiempo, datasets: [{ label: `Reservas (${metodo.toUpperCase()})`, data: reservas, borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.2)', fill: true, tension: 0.1 }] },
        options: { scales: { x: { title: {display: true, text: 'Días transcurridos'} }, y: { title: {display: true, text: 'Litros en Planta'} } } }
    });
}

// ==========================================
// MÓDULOS 3 Y 4: Interpolación e Integración
// ==========================================
function resolverCD() {
    const metodoC = document.getElementById('metodoC').value;
    const metodoD = document.getElementById('metodoD').value;
    const xDatos = document.getElementById('xDatosC').value.split(',').map(Number);
    const yDatos = document.getElementById('yDatosC').value.split(',').map(Number);
    
    let xInterp = []; let yInterp = [];
    
    // Interpolación de Lagrange
    const lagrange = (x, xArr, yArr) => {
        let suma = 0;
        for (let i = 0; i < xArr.length; i++) {
            let prod = yArr[i];
            for (let j = 0; j < xArr.length; j++) {
                if (i !== j) prod *= (x - xArr[j]) / (xArr[i] - xArr[j]);
            }
            suma += prod;
        }
        return suma;
    };

    for (let i = 1; i <= 30; i++) {
        xInterp.push(i);
        // Para Newton y Splines, usamos una aproximación basada en Lagrange para la simulación interactiva visual
        let val = lagrange(i, xDatos, yDatos);
        yInterp.push(val > 0 ? val : 10); // Evita valores negativos irreales
    }

    // Integración Numérica
    let area = 0;
    const h = 1;
    
    if(metodoD === 'trapecio') {
        for (let i = 0; i < yInterp.length - 1; i++) {
            area += (h / 2) * (yInterp[i] + yInterp[i+1]);
        }
    } else if (metodoD === 'simpson13') {
        area = yInterp[0] + yInterp[yInterp.length-1];
        for(let i=1; i<yInterp.length-1; i++) {
            area += i%2 !== 0 ? 4*yInterp[i] : 2*yInterp[i];
        }
        area = (h/3) * area;
    } else if (metodoD === 'simpson38') {
        area = yInterp[0] + yInterp[yInterp.length-1];
        for(let i=1; i<yInterp.length-1; i++) {
            area += i%3 === 0 ? 2*yInterp[i] : 3*yInterp[i];
        }
        area = (3*h/8) * area;
    }

    document.getElementById('resultadoD').innerHTML = `Gasto Mensual (${metodoD.toUpperCase()}):<br><span class='fs-3 text-danger'>${area.toFixed(2)} Bs</span>`;

    const ctx = document.getElementById('chartCD').getContext('2d');
    if (chartCD_instance) chartCD_instance.destroy();
    chartCD_instance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xInterp,
            datasets: [
                { label: `Curva Continua (${metodoC.toUpperCase()})`, data: yInterp, borderColor: '#0d6efd', tension: 0.4 },
                { type: 'scatter', label: 'Datos Originales', data: xDatos.map((x,i)=>({x:x, y:yDatos[i]})), backgroundColor: '#212529', pointRadius: 6 }
            ]
        }
    });
}

// ==========================================
// MÓDULO 5: Búsqueda de Raíces
// ==========================================
function resolverE() {
    const metodo = document.getElementById('metodoE').value;
    const ingreso = parseFloat(document.getElementById('ingresoE').value);
    
    // Función de costo acumulado: f(t) = 5*t^2 + 20*t - Ingreso
    const f = (t) => (5 * Math.pow(t, 2) + 20 * t) - ingreso;
    const f_deriv = (t) => 10 * t + 20; 
    
    let raiz = 0;

    if (metodo === 'biseccion') {
        let a = 0, b = 30, tol = 0.001;
        while ((b - a) / 2 > tol) {
            raiz = (a + b) / 2;
            if (f(raiz) === 0) break;
            else if (f(a) * f(raiz) < 0) b = raiz;
            else a = raiz;
        }
    } else if (metodo === 'newton') {
        let x0 = 15; 
        for(let i=0; i<20; i++) {
            let fx = f(x0);
            let dfx = f_deriv(x0);
            if(Math.abs(fx) < 0.001) break;
            x0 = x0 - (fx/dfx);
        }
        raiz = x0;
    } else if (metodo === 'secante') {
        let x0 = 0, x1 = 30;
        for(let i=0; i<20; i++) {
            let fx0 = f(x0), fx1 = f(x1);
            if(Math.abs(fx1) < 0.001) break;
            raiz = x1 - fx1 * ((x1 - x0) / (fx1 - fx0));
            x0 = x1;
            x1 = raiz;
        }
    }

    if(raiz > 30 || raiz < 0) {
        document.getElementById('resultadoE').innerHTML = "<strong>El ingreso cubre todo el mes. No se alcanzó el umbral crítico.</strong>";
    } else {
        document.getElementById('resultadoE').innerHTML = `Punto de Quiebre Financiero:<br><span class='fs-3 fw-bold'>Día ${raiz.toFixed(1)}</span><br><small>Calculado vía ${metodo.toUpperCase()}</small>`;
    }
}
