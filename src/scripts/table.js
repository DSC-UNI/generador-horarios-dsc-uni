const stringToHTML = (str) => {
  let parser = new DOMParser();
  let doc = parser.parseFromString(str, "text/html");
  return doc.body;
};

const format = (d, c) => {
  let panel = `<div></div>`;

  let doc = stringToHTML(panel).firstElementChild;

  Object.keys(d.Secciones).forEach((seccion) => {
    let content = `
    <table class="table-seccion">
          <tr>
            <th>Tipo</th>
            <th>Dia</th>
            <th>Hora</th>
            <th>Profesor</th>
          </tr>
    </table>
    `;
    let rows = stringToHTML(content).firstElementChild;

    d.Secciones[seccion].forEach((item) => {
      rows.insertAdjacentHTML(
        "beforeend",
        `
      <tr>
        <td>${item.Tipo}</td>
        <td>${item.Dia}</td>
        <td>${item.Hora}</td>
        <td>${item.Profesor}</td>
      </tr>
      `
      );
    });

    doc.insertAdjacentHTML(
      "beforeend",
      `<div style="margin: 0; padding: 0;">
        <div class="wrapper">
          <div class="box1 ">Seccion: <span>${seccion}</span></div>
          <div class="box2 ${c} accordion">Ver</div>
          <div class="box3">
            <label>Seleccionar: <input type="checkbox" class="cbox cbox-${c}" id="${c}-${seccion}"></label>
          </div>
        </div>
        <div class="box4 panel">
            ${rows.outerHTML}
        </div>
      </div>
      `
    );
  });

  return doc;
};

$(document).ready(() => {
  const table = $("#example").DataTable({
    ajax: {
      url: "https://generador-horarios-9b2f8-default-rtdb.firebaseio.com/GoogleSheetData.json",
      dataSrc: function (json) {
        return json;
      },
    },
    searching: true,
    paging: false,
    info: false,
    stateSave: false,
    language: {
      searchPlaceholder: "Buscar...",
      search: "",
    },
    scrollY: "60vh",
    initComplete: function () {
      this.api()
        .columns([1])
        .every(function () {
          let column = this;
          let select = $(
            '<select><option value="">Seleccionar</option></select>'
          )
            .appendTo($(column.footer()).empty())
            .on("change", function () {
              let val = $.fn.dataTable.util.escapeRegex($(this).val());

              column.search(val ? "^" + val + "$" : "", true, false).draw();
            });

          column
            .data()
            .unique()
            .sort()
            .each(function (d, j) {
              // console.log("->", j);
              select.append('<option value="' + d + '">' + d + "</option>");
            });
        });
    },
    columns: [
      {
        className: "dt-control",
        orderable: false,
        data: null,
        defaultContent: "",
      },
      { data: "Ciclo" },
      { data: "Codigo" },
      { data: "Nombre" }
    ],
    order: [[0, "asc"]],
  });

  let arrayColors = [
    "#009f4d",
    "#a51890",
    "#0085ad",
    "#efdf00",
    "#84bd00",
    "#da1884",
    "#4285f4",
    "#ff9900",
  ];

  $("#example").on("click", "tbody td.dt-control", function (event1) {
    let firstEvent = event1.currentTarget;
    let codigoCurso = firstEvent.parentElement.children[2].textContent;
    firstEvent.parentElement.id = codigoCurso;
    let tr = $(this).closest("tr");
    let row = table.row(tr);

    if (row.child.isShown()) {
      row.child.hide();
    } else {
      row.child(format(row.data(), codigoCurso)).show();
    }

    let acc = document.querySelectorAll(`.${codigoCurso}`);

    for (let i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        let panelSection = this.parentElement.nextElementSibling;
        if (panelSection.style.maxHeight) {
          panelSection.style.maxHeight = null;
        } else {
          panelSection.style.maxHeight = panelSection.scrollHeight + "px";
        }
      });
    }

    const cbox = document.querySelectorAll(`.cbox-${codigoCurso}`);

    cbox.forEach((checkbox) => {
      checkbox.addEventListener("click", (event2) => {
        let seccionCurso =
          event2.currentTarget.parentElement.parentElement.parentElement
            .firstElementChild.firstElementChild.textContent;

        let contenidoSecciones =
          event2.currentTarget.parentElement.parentElement.parentElement
            .parentElement;

        if (event2.currentTarget.checked) {
          cbox.forEach((check) => {
            if (
              check.parentElement.parentElement.parentElement.parentElement
                .id == contenidoSecciones.id
            ) {
              if (check.id == event2.currentTarget.id) {
                check.checked = true;
                let color =
                  arrayColors[Math.floor(Math.random() * arrayColors.length)];
                firstEvent.parentElement.style.backgroundColor = `${color}`;
                firstEvent.parentElement.id = `${codigoCurso}`;

                let boxPanel2 = document.querySelector(".box-panel-2");

                let codigoCurso2Id = document.querySelector(
                  `#${codigoCurso}-${codigoCurso}`
                );

                if (codigoCurso2Id) {
                  codigoCurso2Id.style.backgroundColor = `${color}`;
                  codigoCurso2Id.innerHTML = `<span>${codigoCurso} ${seccionCurso}</span>
                  <span class="closebtn" onclick="this.parentElement.remove(); getElementById('${codigoCurso}').style.backgroundColor =
                  'rgba(255, 255, 255, 0)'; getElementById('${codigoCurso}-${seccionCurso}').checked = false">&times;</span>`;
                } else {
                  boxPanel2.insertAdjacentHTML(
                    "beforeend",
                    `
                  <div class="chip" id="${codigoCurso}-${codigoCurso}" style="background-color: ${color}">
                    <span>${codigoCurso} ${seccionCurso}</span>
                    <span class="closebtn" onclick="this.parentElement.remove(); getElementById('${codigoCurso}').style.backgroundColor =
                    'rgba(255, 255, 255, 0)'; getElementById('${codigoCurso}-${seccionCurso}').checked = false">&times;</span>
                  </div>
                  `
                  );
                }
              } else {
                check.checked = false;
              }
            }
          });
        } else {
          firstEvent.parentElement.style.backgroundColor =
            "rgba(255, 255, 255, 0)";
          document.getElementById(`${codigoCurso}-${codigoCurso}`).remove();
        }
      });
    });
  });
});
