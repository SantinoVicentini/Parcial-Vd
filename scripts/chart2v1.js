d3.dsv(';', '../data/ruidos_molestos.csv', d3.autoType).then(data => {
  // Filtrar los datos de "RUIDOS MOLESTOS, EMANACIONES O DERRAMES"
  let ruidosMolestos = data.filter(d => d.subcategoria === 'RUIDOS MOLESTOS, EMANACIONES O DERRAMES' && (d.tipo_prestacion === 'DENUNCIA' || d.tipo_prestacion === 'Denuncia'));
  // Agrupar los datos por fecha_ingreso y contar la cantidad de casos por fecha
  let parser = d3.timeParse("%d/%m/%Y");
  ruidosMolestos = ruidosMolestos.filter(d => {
    let fecha = parser(d.fecha_ingreso);
    let mes = fecha.getMonth();
    return mes === 0 || mes === 1 || mes === 2;
  });
  let casosPorFecha = d3.group(ruidosMolestos, d => parser(d.fecha_ingreso));
  const esLocale = 'es-ES'; // definimos el locale en español
  const formatOptions = { weekday: 'long' }; // opciones de formato para obtener el nombre del día
  let ordenDias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

  let datosPorFecha = Array.from(casosPorFecha, ([fecha, datos]) => ({
    cantidad: datos.length,
    dia: new Intl.DateTimeFormat(esLocale, formatOptions).format(new Date(fecha))
  }));

  datosPorFecha = Array.from(d3.rollup(datosPorFecha, v => d3.sum(v, d => d.cantidad), d => d.dia), ([dia, cantidad]) => ({
    dia: dia,
    cantidad: cantidad
  }));

  datosPorFecha.sort((a, b) => {
    return ordenDias.indexOf(a.dia) - ordenDias.indexOf(b.dia);
  });

  // Encontrar el punto más alto
  let maxIndex = 0;
  let maxValue = 0;
  datosPorFecha.forEach((d, i) => {
    if (d.cantidad > maxValue) {
      maxValue = d.cantidad;
      maxIndex = i;
    }
  });

  // Crear el gráfico de líneas utilizando los datos filtrados y agrupados
  let chart = Plot.plot({
    marks: [
      Plot.line(datosPorFecha, {x: "dia", y: "cantidad", stroke:"#282828"}),
      Plot.circle([datosPorFecha[maxIndex]], {x: "dia", y: "cantidad", r: 4, fill: "#0000FF"})
    ],
    x: {
      label: "",
      domain: ordenDias,
    },
    y: {
      label: "Denuncias Verano",
      domain: [130, 240],
      grid: true
    }
  });

  // Agregar el gráfico al elemento con el id "chart" del HTML
  d3.select('#chart2v1').append(() => chart);
})
