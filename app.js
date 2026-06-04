let chartB_instance = null;
let chartCD_instance = null;
let chartE_instance = null;

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
        document.getElementById('matrizA').value = "5, -1, 0\n-1, 0.5, -1\n0, -1, 5"; 
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
    let iterMax = 20; // Limitado a 20 para visualización
    let divergiendo = false;
    
    let esGauss = (metodo === 'gauss-seidel' || metodo === 'sor');
    let w = metodo === 'sor' ? 1.25 : 1; 

    // Preparar tabla de proceso
    let procesoHTML = `<h6 class="fw-bold">Detalle Iterativo (${metodo.toUpperCase()})</h6>`;
    procesoHTML += `<table class="table table-sm table-bordered text-center"><thead><tr><th>Iter</th><th>X1</th><th>X2</th><th>X3</th><th>Error Máx</th></tr></thead><tbody>`;

    for (let iter = 0; iter < iterMax; iter++) {
        let x_old = [...x];
        let errorMax = 0;

        for (let i = 0; i < n; i++) {
            let suma = 0;
            for (let j = 0; j < n; j++) {
                if (j !== i) suma += A[i][j] * (esGauss ? x[j] : x_old[j]);
            }
            if(Math.abs(A[i][i]) < 0.001) { divergiendo = true; break; }
            
            let valorNuevo = (b[i] - suma) / A[i][i];
            x[i] = w * valorNuevo + (1 - w) * x_old[i];
            errorMax = Math.max(errorMax, Math.abs(x[i] - x_old[i]));
        }

        if(divergiendo) break;
        
        procesoHTML += `<tr><td>${iter+1}</td><td>${x[0].toFixed(4)}</td><td>${x[1].toFixed(4)}</td><td>${x[2].toFixed(4)}</td><td>${errorMax.toFixed(4)}</td></tr>`;
        
        if(errorMax < 0.0001 && iter > 0) break; // Convergencia alcanzada
    }
    procesoHTML += `</tbody></table>`;

    const cajaProceso = document.getElementById('procesoA');
    cajaProceso.classList.remove('d-none');

    if(divergiendo) {
        document.getElementById('resultadoA').innerHTML = `<strong class='text-danger'>Error: El sistema diverge por ceros en la diagonal.</strong>`;
        cajaProceso.innerHTML = "<p class='text-danger'>Proceso interrumpido: Inestabilidad detectada.</p>";
    } else {
        let html = `<strong>Solución Final:</strong><ul class='mt-2 mb-0'>`;
        x.forEach((val, i) => html += `<li>Zona ${i+1}: <strong>${val.toFixed(2)}</strong></li>`);
        html += "</ul>";
        document.getElementById('resultadoA').innerHTML = html;
        cajaProceso.innerHTML = procesoHTML;
    }
}

// ==========================================
// MÓDULO 2: Ecuaciones Diferenciales
// ==========================================
function cargarCasoB() {
    const caso = document.getElementById('casoB').value;
    document.getElementById('resInicialB').value = 50000;
    document.getElementById('entradaB').value = 2000;
    document.getElementById('consumoB').value = caso === 'normal' ? 2500 : 5000;
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

    let procesoHTML = `<h6 class="fw-bold">Evaluación Paso a Paso (${metodo.toUpperCase()})</h6>`;
    procesoHTML += `<table class="table table-sm table-bordered text-center"><thead><tr><th>Día (t)</th><th>Reserva R(t)</th>`;
    if(metodo==='rk4') procesoHTML += `<th>k1</th><th>k2</th><th>k3</th><th>k4</th>`;
    procesoHTML += `</tr></thead><tbody>`;

    while (R > 0 && t <= 30) {
        tiempo.push(t); reservas.push(R);
        
        procesoHTML += `<tr><td>${t}</td><td>${R.toFixed(2)}</td>`;

        if(metodo === 'euler') {
            let pendiente = f(t, R);
            procesoHTML += `</tr>`;
            R = R + h * pendiente;
        } else if (metodo === 'heun') {
            let k1 = f(t, R);
            let k2 = f(t + h, R + h*k1);
            procesoHTML += `</tr>`;
            R = R + (h/2) * (k1 + k2);
        } else if(metodo === 'rk4') {
            let k1 = f(t, R);
            let k2 = f(t + h/2, R + h*k1/2);
            let k3 = f(t + h/2, R + h*k2/2);
            let k4 = f(t + h, R + h*k3);
            procesoHTML += `<td>${k1.toFixed(1)}</td><td>${k2.toFixed(1)}</td><td>${k3.toFixed(1)}</td><td>${k4.toFixed(1)}</td></tr>`;
            R = R + (h/6) * (k1 + 2*k2 + 2*k3 + k4);
        }
        t += h;
    }
    
    if(R <= 0) { tiempo.push(t); reservas.push(0); }
    procesoHTML += `</tbody></table>`;
    
    document.getElementById('procesoB').classList.remove('d-none');
    document.getElementById('procesoB').innerHTML = procesoHTML;

    const ctx = document.getElementById('chartB').getContext('2d');
    if (chartB_instance) chartB_instance.destroy();
    chartB_instance = new Chart(ctx, {
        type: 'line',
        data: { labels: tiempo, datasets: [{ label: `Reservas (${metodo.toUpperCase()})`, data: reservas, borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.2)', fill: true, tension: 0.1 }] },
        options: { scales: { x: { title: {display: true, text: 'Días'} }, y: { title: {display: true, text: 'Litros'} } } }
    });
}

// ==========================================
// MÓDULOS 3 Y 4: Interpolación e Integración
// ==========================================
function resolverCD() {
    const metodoD = document.getElementById('metodoD').value;
    const xDatos = document.getElementById('xDatosC').value.split(',').map(Number);
    const yDatos = document.getElementById('yDatosC').value.split(',').map(Number);
    
    let xInterp = []; let yInterp = [];
    
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
        let val = lagrange(i, xDatos, yDatos);
        yInterp.push(val > 0 ? val : 10); 
    }

    let area = 0;
    const h = 1;
    let procesoHTML = `<h6 class="fw-bold">Sumatoria de Área (${metodoD.toUpperCase()})</h6>`;
    procesoHTML += `<p>Suma paso a paso de los tramos calculados:</p><ul>`;
    
    if(metodoD === 'trapecio') {
        for (let i = 0; i < yInterp.length - 1; i++) {
            let tramo = (h / 2) * (yInterp[i] + yInterp[i+1]);
            area += tramo;
            if(i < 5) procesoHTML += `<li>Tramo ${i+1}-${i+2}: ${tramo.toFixed(2)} Bs</li>`;
        }
        procesoHTML += `<li>... (hasta el día 30)</li></ul>`;
    } else if (metodoD === 'simpson13') {
        area = yInterp[0] + yInterp[yInterp.length-1];
        procesoHTML += `<li>Términos extremos: ${yInterp[0].toFixed(2)} + ${yInterp[yInterp.length-1].toFixed(2)}</li>`;
        let sumaImpares = 0, sumaPares = 0;
        for(let i=1; i<yInterp.length-1; i++) {
            if(i%2 !== 0) sumaImpares += yInterp[i];
            else sumaPares += yInterp[i];
        }
        area += 4*sumaImpares + 2*sumaPares;
        area = (h/3) * area;
        procesoHTML += `<li>4 * Suma(Impares) = ${ (4*sumaImpares).toFixed(2) }</li>`;
        procesoHTML += `<li>2 * Suma(Pares) = ${ (2*sumaPares).toFixed(2) }</li></ul>`;
        procesoHTML += `<p>Fórmula final: (h/3) * Sumatoria Total = ${area.toFixed(2)}</p>`;
    }

    document.getElementById('resultadoD').innerHTML = `Gasto Mensual:<br><span class='fs-3 text-danger'>${area.toFixed(2)} Bs</span>`;
    document.getElementById('procesoCD').classList.remove('d-none');
    document.getElementById('procesoCD').innerHTML = procesoHTML;

    const ctx = document.getElementById('chartCD').getContext('2d');
    if (chartCD_instance) chartCD_instance.destroy();
    chartCD_instance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xInterp,
            datasets: [
                { label: `Curva Continua (Lagrange)`, data: yInterp, borderColor: '#0d6efd', tension: 0.4 },
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
    
    // Función f(t) = 5*t^2 + 20*t - Ingreso
    const f = (t) => (5 * Math.pow(t, 2) + 20 * t) - ingreso;
    const f_deriv = (t) => 10 * t + 20; 
    
    let raiz = null;
    let procesoHTML = `<h6 class="fw-bold">Iteraciones (${metodo.toUpperCase()})</h6>`;
    procesoHTML += `<table class="table table-sm table-bordered text-center"><thead>`;

    if (metodo === 'biseccion') {
        let a = 0, b = 30, tol = 0.001, c=0;
        procesoHTML += `<tr><th>Iter</th><th>a</th><th>b</th><th>c (Raíz)</th><th>f(c)</th></tr></thead><tbody>`;
        for(let iter=1; iter<=20; iter++) {
            c = (a + b) / 2;
            let fc = f(c);
            procesoHTML += `<tr><td>${iter}</td><td>${a.toFixed(4)}</td><td>${b.toFixed(4)}</td><td class='fw-bold'>${c.toFixed(4)}</td><td>${fc.toFixed(4)}</td></tr>`;
            if (Math.abs(fc) < tol) { raiz = c; break; }
            if (f(a) * fc < 0) b = c; else a = c;
        }
    } else if (metodo === 'newton') {
        let x0 = 15; 
        procesoHTML += `<tr><th>Iter</th><th>x_i</th><th>f(x_i)</th><th>f'(x_i)</th><th>x_i+1</th></tr></thead><tbody>`;
        for(let iter=1; iter<=10; iter++) {
            let fx = f(x0);
            let dfx = f_deriv(x0);
            let x1 = x0 - (fx/dfx);
            procesoHTML += `<tr><td>${iter}</td><td>${x0.toFixed(4)}</td><td>${fx.toFixed(4)}</td><td>${dfx.toFixed(4)}</td><td class='fw-bold'>${x1.toFixed(4)}</td></tr>`;
            if(Math.abs(fx) < 0.001) { raiz = x1; break; }
            x0 = x1;
        }
    } else if (metodo === 'secante') {
        let x0 = 0, x1 = 30;
        procesoHTML += `<tr><th>Iter</th><th>x_0</th><th>x_1</th><th>f(x_1)</th><th>Raíz Calc.</th></tr></thead><tbody>`;
        for(let iter=1; iter<=10; iter++) {
            let fx0 = f(x0), fx1 = f(x1);
            let calc = x1 - fx1 * ((x1 - x0) / (fx1 - fx0));
            procesoHTML += `<tr><td>${iter}</td><td>${x0.toFixed(4)}</td><td>${x1.toFixed(4)}</td><td>${fx1.toFixed(4)}</td><td class='fw-bold'>${calc.toFixed(4)}</td></tr>`;
            if(Math.abs(fx1) < 0.001) { raiz = calc; break; }
            x0 = x1; x1 = calc;
        }
    }

    procesoHTML += `</tbody></table>`;
    document.getElementById('procesoE').classList.remove('d-none');
    document.getElementById('procesoE').innerHTML = procesoHTML;

    if(!raiz || raiz > 30 || raiz < 0) {
        document.getElementById('resultadoE').innerHTML = "<strong>El ingreso cubre todo el mes.</strong>";
    } else {
        document.getElementById('resultadoE').innerHTML = `Día Crítico Encontrado: <strong>${raiz.toFixed(2)}</strong>`;
    }

    // Gráfico de la función y la raíz
    let valsX = [], valsY = [];
    for(let i=0; i<=30; i++) { valsX.push(i); valsY.push(f(i)); }

    const ctx = document.getElementById('chartE').getContext('2d');
    if (chartE_instance) chartE_instance.destroy();
    chartE_instance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: valsX,
            datasets: [
                { label: 'f(t) = Costo - Ingreso', data: valsY, borderColor: '#6c757d', tension: 0.3 },
                { type: 'scatter', label: 'Raíz (Día Crítico)', data: raiz ? [{x: raiz, y: 0}] : [], backgroundColor: '#dc3545', pointRadius: 8 }
            ]
        },
        options: {
            plugins: { annotation: { annotations: { line1: { type: 'line', yMin: 0, yMax: 0, borderColor: 'rgba(255,0,0,0.3)', borderWidth: 2 } } } }
        }
    });
}
