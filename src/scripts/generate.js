const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const generateButtom = document.querySelector("#generate");

generateButtom.addEventListener("click", (event) => {
  let calendarEvent = document.querySelectorAll(".calendar_event");

  calendarEvent.forEach((element) => {
    element.remove();
  });
  let selected = document.querySelectorAll(".chip");

  let arraySelect = [];
  let arrayColors = [];

  selected.forEach((item) => {
    if (item.childNodes[0]) {
      arraySelect.push(item.childNodes[0].textContent.replace(" ", ""));
      // nameSelect.push(item.childNodes[2].textContent);
    }

    if (item.childNodes[1]) {
      arraySelect.push(item.childNodes[1].textContent.replace(" ", ""));
      // nameSelect.push(item.childNodes[3].textContent);
    }

    let rgbArray = item.style.backgroundColor
      .replace("rgb", "")
      .slice(1, item.style.backgroundColor.replace("rgb", "").length - 1)
      .split(", ");

    arrayColors.push(
      rgbToHex(
        Number.parseInt(rgbArray[0], 10),
        Number.parseInt(rgbArray[1], 10),
        Number.parseInt(rgbArray[2], 10)
      )
    );
  });

  let newArraySelect = [];
  let newNameSelect = [];
  arraySelect
    .toString()
    .replace(/\s+/g, "")
    .split(",,")
    .toString()
    .split(",,")
    .toString()
    .split(",")
    .forEach((item) => {
      if (item !== "") {
        newArraySelect.push(item);
      }
    });
  // nameSelect
  //   .toString()
  //   .replace(/\s+/g, "")
  //   .split(",,")
  //   .toString()
  //   .split(",,")
  //   .toString()
  //   .split(",")
  //   .forEach((item) => {
  //     if (item !== "") {
  //       newNameSelect.push(item);
  //     }
  //   });
  // console.log(newArraySelect);
  console.log(newNameSelect);
  // console.log(arrayColors);
  generateSchedule(newArraySelect, arrayColors);
});

// Crear la tabla representando un horario en blanco, en donde colocaremos los cursos
function horarioBlanco() {
  let tabla = [];
  let tablaLinea = [];
  for (let i = 0; i < 14; i++) {
    for (let j = 0; j < 6; j++) {
      tablaLinea.push("");
    }
    tabla.push(tablaLinea);
    tablaLinea = [];
  }
  return tabla;
}

// -------------- Preparar la data -------------- //
// Se crean "coordenadas" para cada horario de cada sección de cada curso,
// las cuales van a representar un lugar en la tabla del horario,
// con un x representando a la hora que corresponden y un y representando el día
function crearCoordenadas(dataTable) {
  for (const curso in dataTable) {
    for (const sec in dataTable[curso].Secciones) {
      for (let i = 0; i < dataTable[curso].Secciones[sec].length; i++) {
        let diaEnNumero = cursoDia(dataTable[curso].Secciones[sec][i].Dia);
        let horasEnNumero = cursoHoras(dataTable[curso].Secciones[sec][i].Hora);
        if (dataTable[curso].Secciones[sec][i].Tipo == "P/L")
          dataTable[curso].Secciones[sec][i].Tipo = "P";
        dataTable[curso].Secciones[sec][i].Coordenadas = [
          horasEnNumero,
          diaEnNumero,
        ];
      }
    }
  }
}

// Convertir un día a un número del 0 al 5. Ejem: Martes -> 1
function cursoDia(dia) {
  switch (dia) {
    case "LU":
      return 0;
    case "MA":
      return 1;
    case "MI":
      return 2;
    case "JU":
      return 3;
    case "VI":
      return 4;
    case "SA":
      return 5;
  }
}
// Convertir una hora a un número del 0 al 13. Ejem: 10:00-11:00 -> 2
function cursoHoras(horas) {
  let limInf = parseInt(horas.split("-")[0].split(":")[0]);
  let limSup = parseInt(horas.split("-")[1].split(":")[0]);
  let horasNumero = [];
  for (let i = limInf; i < limSup; i++) {
    horasNumero.push(i - 8);
  }
  return horasNumero;
}

// -------------- Crear un horario -------------- //
// Usando un conjunto de tablas de horarios para cada curso y sección la cual se ha
// seleccionado se crea un horario compartido en la cual se podrá observar cuando
// los cursos tienen cruce y como luciría el horario final
function horarioCompartido(conjunHorarios, arregloCursos, datatable) {
  let tablita = conjunHorarios[0];
  for (let i = 0; i < tablita.length; i++) {
    for (let j = 0; j < tablita[0].length; j++) {
      if (tablita[i][j] != "") {
        tablita[i][j] = "1" + tablita[i][j];
      }
    }
  }
  for (let conjun = 1; conjun < conjunHorarios.length; conjun++) {
    for (let i = 0; i < tablita.length; i++) {
      for (let j = 0; j < tablita[0].length; j++) {
        if (tablita[i][j] != "" || conjunHorarios[conjun][i][j] != "") {
          if (tablita[i][j] != "" && conjunHorarios[conjun][i][j] != "") {
            tablita[i][j] =
              tablita[i][j] + "-" + (conjun + 1) + conjunHorarios[conjun][i][j];
          } else {
            if (tablita[i][j] != "") tablita[i][j] = tablita[i][j];
            else tablita[i][j] = conjun + 1 + conjunHorarios[conjun][i][j];
          }
        }
      }
    }
  }
  let noHayCruce = existeCruces(tablita, arregloCursos, datatable);
  let cumpleCiclos = CiclosConsecutivos(datatable, arregloCursos);
  if (noHayCruce && cumpleCiclos) {
    var posibilidadHorario = true;
  } else {
    var posibilidadHorario = false;
  }
  return [posibilidadHorario, tablita, noHayCruce, cumpleCiclos];
}

// En esta función se realizará una tabla de horario para el curso seleccionado
function pintarHorarioSeccion(seccion) {
  let tablita = horarioBlanco();
  for (let i = 0; i < seccion.length; i++) {
    let tipo = seccion[i].Tipo;
    for (let j = 0; j < seccion[i].Coordenadas[0].length; j++) {
      let x = seccion[i].Coordenadas[0][j];
      let y = seccion[i].Coordenadas[1];
      tablita[x][y] = tipo;
    }
  }
  return tablita;
}
// Se crea el conjunto de tablas de horarios que usa horarioCompartido, en la cual
// se introducira un arreglo en donde se indiquen {indiceCurso, seccionCurso}
function crearConjuntoCursos(arregloCursos, datatable) {
  let cursosConvertido = [];
  for (let i = 0; i < arregloCursos.length; i++) {
    cursosConvertido.push(
      pintarHorarioSeccion(
        datatable[arregloCursos[i].split("/")[0]].Secciones[
        arregloCursos[i].split("/")[1]
        ]
      )
    );
  }
  console.log(cursosConvertido);
  return cursosConvertido;
}

// -------------- Depuración de horario -------------- //
// Existen los siguientes problemas al realizar el horario:
// 1. Los cursos desaprobados no se encuentran (Dependerá del usuario)
// 2. Regla de 3 ciclos consecutivos
// 3. Cruces:
// 3.1. Existen más de 2 cruces T-T
// 3.2. Existe 1 o más curces P-L, P-P, L-L

// Detecta si todos los cursos seleccionados pertenecen a 3 ciclos consecutivos
// (false = no cumple el requisito, true = cumple el requisito)
function CiclosConsecutivos(dataTable, arregloCursos) {
  let ciclos = [];
  for (let curso in arregloCursos) {
    ciclos.push(dataTable[parseInt(arregloCursos[curso].split("/")[0])].Ciclo);
  }
  const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
  };
  var ciclosDistintos = ciclos.filter(distinct);
  ciclosDistintos.sort();
  let numMinimo = ciclosDistintos[0];
  for (var i in ciclosDistintos) {
    if (ciclosDistintos[i] < numMinimo || ciclosDistintos[i] > numMinimo + 2) {
      return false;
    }
  }
  return true;
}

// Detecta si hay cruces o no: (true = no hay cruce o hay cruces permitidos, false = cruces no permitidos)
function existeCruces(horarioCompleto, arregloCursos, datatable) {
  let errores = [];
  let TipErrores = [0, 0];
  for (let i = 0; i < horarioCompleto.length; i++) {
    for (let j = 0; j < horarioCompleto[0].length; j++) {
      if (horarioCompleto[i][j] != "") {
        if (horarioCompleto[i][j].includes("-")) {
          curso1indice = parseInt(horarioCompleto[i][j].split("-")[0][0]);
          curso2indice = parseInt(horarioCompleto[i][j].split("-")[1][0]);
          curso1completo = encontrarCursoXIndice(
            arregloCursos[curso1indice - 1].split("/")[0],
            arregloCursos[curso1indice - 1].split("/")[1],
            datatable
          );
          curso2completo = encontrarCursoXIndice(
            arregloCursos[curso2indice - 1].split("/")[0],
            arregloCursos[curso2indice - 1].split("/")[1],
            datatable
          );
          // errores.push("Hay cruce entre el curso " + curso1completo.split("/")[0] + " sección " + curso1completo.split("/")[1] + " y el curso "+ curso2completo.split("/")[0] + " sección " + curso2completo.split("/")[1])
          errores.push(
            horarioCompleto[i][j].split("-")[0][1] +
            "/" +
            horarioCompleto[i][j].split("-")[1][1]
          );
        }
      }
    }
  }
  for (let j = 0; j < errores.length; j++) {
    if (
      errores[j] == "P/T" ||
      errores[j] == "T/P" ||
      errores[j] == "L/T" ||
      errores[j] == "T/L" ||
      errores[j] == "T/T"
    ) {
      TipErrores[0] += 1;
    } else if (
      errores[j] == "P/P" ||
      errores[j] == "P/L" ||
      errores[j] == "L/P" ||
      errores[j] == "L/L"
    ) {
      TipErrores[1] += 1;
    }
  }
  if (TipErrores[1] > 0) {
    return false;
  }
  if (TipErrores[0] > 2) {
    return false;
  }
  return true;
}

// -------------- Herramientas de Búsqueda -------------- //
// Se encuentra el índice en la tabla de data del
// curso al cual le corresponde el codigo y sección introducido
// Además indica si existe el curso o sección, devolviendo NA si no existen
function encontrarCursoXCodigo(codigo, seccion, dataTable) {
  let codigoCursoEncontrado = "";
  let seccionCursoEncontrado = "";
  let respuesta = "";
  for (const curso in dataTable) {
    if (dataTable[curso].Codigo == codigo) {
      codigoCursoEncontrado = curso;
      for (const sec in dataTable[curso].Secciones) {
        if (sec == seccion) {
          seccionCursoEncontrado = sec;
        }
      }
    }
  }
  if (codigoCursoEncontrado == "") respuesta = "NA";
  else respuesta = codigoCursoEncontrado;
  if (seccionCursoEncontrado == "") respuesta = respuesta + "/" + "NA";
  else respuesta = respuesta + "/" + seccionCursoEncontrado;
  return respuesta;
}

// Se encuentra el código en la tabla de data del
// curso al cual le corresponde el índice y sección introducido
// Además indica si existe el curso o sección, devolviendo NA si no existen
function encontrarCursoXIndice(codigo, seccion, dataTable) {
  let codigoCursoEncontrado = "";
  let seccionCursoEncontrado = "";
  let respuesta = "";
  if (codigo < dataTable.length) {
    codigoCursoEncontrado = dataTable[codigo].Codigo;
    for (const sec in dataTable[codigo].Secciones) {
      if (sec == seccion) {
        seccionCursoEncontrado = sec;
      }
    }
  }
  if (codigoCursoEncontrado == "") respuesta = "NA";
  else respuesta = codigoCursoEncontrado;
  if (seccionCursoEncontrado == "") respuesta = respuesta + "/" + "NA";
  else respuesta = respuesta + "/" + seccionCursoEncontrado;
  return respuesta;
}

// Crear la linea de cursos
function crearLineaCursos(arrCursos, dataTable) {
  let lineaCurso = [];
  for (let i = 0; i < arrCursos.length; i++) {
    lineaCurso.push(
      encontrarCursoXCodigo(
        arrCursos[i].substring(0, 5),
        arrCursos[i].substring(5, 6),
        dataTable
      )
    );
  }
  return lineaCurso;
}

function generateSchedule(lineaDeEntrada, arrayColors) {
  fetch(
    "https://generador-horarios-9b2f8-default-rtdb.firebaseio.com/GoogleSheetData.json"
  )
    .then((response) => response.json())
    .then((json) => {
      let dataHorario = json;
      let linea1 = crearLineaCursos(lineaDeEntrada, dataHorario);
      crearCoordenadas(dataHorario);
      const conjunCursos = crearConjuntoCursos(linea1, dataHorario);
      let horarioCreado = horarioCompartido(conjunCursos, linea1, dataHorario);
      generateScheduleTable(
        lineaDeEntrada,
        horarioCreado,
        arrayColors
      );
    });
}

function convertirTipoCurso(tipo) {
  switch (tipo) {
    case "T":
      type = "Teoría";
      break;
    case "P":
      type = "Practica";
      break;
    case "L":
      type = "Laboratorio";
      break;
    default:
      type = "";
      break;
  }
  return type;
}

function generateScheduleTable(
  lineaDeEntrada,
  horarioCreado,
  arrayColors
) {
  //   const labelCruce = document.querySelector("#textoCruce");
  let texto1 = "";
  let texto2 = "";
  color1 = "";
  color2 = "";
  if (horarioCreado[0]) {
    texto1 = "No existen cruces en el horario o existen cruces permitidos.";
    color1 = "black";
    color2 = "black";
  } else {
    if (horarioCreado[2]) {
      texto1 = "No existen cruces en el horario o existen cruces permitidos.";
      color1 = "black";
    } else {
      texto1 = "Existen cruces no permitidos.";
      color1 = "red";
    }
    if (horarioCreado[3]) {
      texto2 = " // Los cursos pertenecen a 3 ciclos consecutivos.";
      color2 = "black";
    } else {
      texto2 = " // Los cursos no pertenecen a 3 ciclos consecutivos.";
      color2 = "red";
    }
  }
  console.log(horarioCreado[2]);
  console.log(horarioCreado[3]);
  const btnclose = document.querySelectorAll(".btnclose");

  const alldays = document.querySelectorAll(".alldays");
  //lbelCruce.textContent = textoMostrar
  //   console.log(labelCruce);
  //   labelCruce.insertAdjacentHTML(
  //     "beforeend",
  //     `<h7 style="color:${color1}">${texto1}</h7><h7 style="color:${color2}">${texto2}</h7>`
  //   );
  let arraySelect = [];
  //   let arrayColors = [
  //     "#009f4d",
  //     "#a51890",
  //     "#0085ad",
  //     "#efdf00",
  //     "#84bd00",
  //     "#da1884",
  //     "#222",
  //     "#ff9900",
  //   ];

  for (let i = 0; i < horarioCreado[1].length; i++) {
    for (let j = 0; j < horarioCreado[1][i].length; j++) {
      if (horarioCreado[1][i][j] !== "") {
        let days = ["LU", "MA", "MI", "JU", "VI", "SA"];
        let hours = [
          "8",
          "9",
          "10",
          "11",
          "12",
          "13",
          "14",
          "15",
          "16",
          "17",
          "18",
          "19",
          "20",
          "21",
        ];
        let infoCourse = "";
        // let nombre = "";

        for (let k = 0; k < horarioCreado[1][i][j].split("-").length; k++) {
          codeCourse =
            lineaDeEntrada[
            horarioCreado[1][i][j].split("-")[k].split("")[0] - 1
            ];
          type = horarioCreado[1][i][j].split("-")[k].split("")[1];
          infoCourse += `${codeCourse}-${type}/`;

          // for (let indice = 0; indice < lineaDeEntrada.length; indice++) {
          //   if (lineaDeEntrada[indice] == codeCourse) {
          //     nombre = nombre + lineaDeEntradaNombre[indice] + "-";
          //   }
          // }
        }
        for (let indice = 0; indice < lineaDeEntrada.length; indice++) {
          if (lineaDeEntrada[indice] == codeCourse) {
            var color = arrayColors[indice];
            //var nombre = lineaDeEntradaNombre[indice]
          }
        }
        arraySelect.push([
          hours[i],
          days[j],
          infoCourse.substring(0, infoCourse.length - 1),
          color
        ]);
      }
    }
  }

  try {
    arraySelect.forEach((course) => {
      codeCourse = "";
      tipo = "";
      // Si hay cruce:
      if (course[2].indexOf("/") > 0) {
        for (var cru in course[2].split("/")) {
          codeCourse =
            codeCourse + course[2].split("/")[cru].substring(0, 6) + "//";
          tipo =
            tipo +
            convertirTipoCurso(course[2].split("/")[cru].substring(7, 8)) +
            "//";
          colorCourse = "#e4002b";
          // nombre = nombre + course[4].split("-")[cru].substring(0, 10) + ".//";
        }
        codeCourse = codeCourse.substring(0, codeCourse.length - 2);
        tipo = tipo.substring(0, tipo.length - 2);
        // nombre = nombre.substring(0, nombre.length - 2);
      } else {
        codeCourse = course[2].substring(0, 6);
        tipo = convertirTipoCurso(course[2].substring(7, 8));
        colorCourse = course[3];
        // nombre = course[4];
      }

      dayId = course[1];
      hourCourse = course[0];

      hourInit = Number.parseInt(hourCourse, 10);
      hourEnd = Number.parseInt(hourCourse, 10) + 1;

      const idf = document.querySelector(`#${dayId}`);

      idf.insertAdjacentHTML(
        "beforeend",
        `<div class="calendar_event" style="position: absolute; left: 0%; top: ${35 * (hourInit - 8) + 1
        }px; width: 100%; height: 35px; overflow: hidden; cursor: n-resize;">
                    <div unselectable="on" style="font-size: 10px; text-align: center;" class="calendar_event_inner">${codeCourse} <br> ${tipo} <br> </div>
                    <div unselectable="on" class="calendar_event_bar" style="position: absolute; background-color: transparent;">
                        <div unselectable="on" class="calendar_default_event_bar_inner" style="top: 0%; height: 100%; background-color: ${colorCourse};"></div>
                    </div>
                </div>`
      );
    });

    const btnclose = document.querySelectorAll(".btnclose");

    const alldays = document.querySelectorAll(".alldays");

    btnclose.forEach((item) => {
      item.addEventListener("click", (event) => {
        alldays.forEach((day) => {
          day.innerHTML = "";
          texto1 = "";
          texto2 = "";
          color1 = "";
          color2 = "";
          //   labelCruce.innerHTML = "";
        });
      });
    });
  } catch (e) {
    console.error();
  }
}

function generateCell() {
  const hours = document.querySelector("#hours");
  const paintcell = document.querySelector(".paint_cell.paint_first");
  const bodycell = document.querySelector("#body_cell");

  for (let i = 8; i <= 21; i++) {
    var inext = i + 1;
    hours.insertAdjacentHTML(
      "beforeend",
      `<tr style="height: 0px;">
        <td style="cursor: default; padding: 0px; border: 0px none;">
            <div class="calendar_rowheader" style="position: relative; height: 35px; overflow: hidden;">
                <div class="calendar_rowheader_inner">
                    <div style="font-size: 10px;text-align: center;">${i}-${inext} hrs
                    
                    </div>
                </div>
            </div>
        </td>
    </tr>`
    );
  }

  const days = ["LU", "MA", "MI", "JU", "VI", "SA"];
  for (let i = 0; i < 6; i++) {
    paintcell.insertAdjacentHTML(
      "beforeend",
      `<td style="padding: 0px; border: 0px none; height: 0px; overflow: visible; text-align: left;">
            <div class="alldays" id="${days[i]}" style="margin-right: 5px; position: relative; height: 1px; margin-top: -1px;"></div>
            <div style="position: relative;"></div>
        </td>`
    );
  }

  let count;

  for (let i = 8; i <= 21; i++) {
    count = i;
    stringCount = count.toString();
    let tr = `<tr class="cell_hour hour_${stringCount}"></tr>`;
    bodycell.insertAdjacentHTML("beforeend", tr);
  }

  const trcell = document.querySelectorAll(".cell_hour");

  for (let i = 0; i < trcell.length; i++) {
    const days = ["LU", "MA", "MI", "JU", "VI", "SA"];

    let cellhourcourse = "";

    days.forEach((day) => {
      cellhourcourse =
        cellhourcourse +
        `<td id="${day}_${trcell[i]
          .getAttribute("class")
          .replace(
            "cell_hour hour_",
            ""
          )}" style="padding: 0px; border: 0px none; vertical-align: top; height: 35px; overflow: hidden;">
            <div class="calendar_cell" style="height: 35px; position: relative;">
                <div unselectable="on" class="calendar_cell_inner"></div>
            </div>
        </td>`;
    });

    trcell[i].insertAdjacentHTML("beforeend", cellhourcourse);
  }
}

generateCell();

const pdfGenerate = document.querySelector("#pdf_generate");

pdfGenerate.addEventListener("click", (event) => {
  event.preventDefault();
  document.documentElement.scrollTop = 0;

  let scheduleGroup = document.getElementById('schedule-group');
  let opt = {
    margin: [2, 0, 1, 0],
    filename: 'horario-generado.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // New Promise-based usage:
  html2pdf().set(opt).from(scheduleGroup).save();

});

