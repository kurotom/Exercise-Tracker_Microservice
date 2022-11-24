document.addEventListener("DOMContentLoaded", () => {

  let exerciseForm = document.querySelector("[data-form-exersice]");
  let userID = document.querySelector("[data-form-id]");
  let exersice = document.querySelector("[data-form-description]");
  let duration = document.querySelector("[data-form-duration]");
  let date = document.querySelector("[data-form-date]");


// // // // // // // // // // // // // // // //
// Format date
  date.oninput = (evento) => {
    let entrada = evento.target.value;
    let regexDate = /^(\d{0,4})?(-)?(\d{0,2})?(-)?(\d{0,2}?)$/;
    let matchDate = entrada.match(regexDate);
    try {
      let arrayDateFormat = [
          matchDate[1],
          matchDate[3] ? "-": "",
          matchDate[3],
          matchDate[5] ? "-": "",
          matchDate[5]
        ].join("");
      evento.target.value = arrayDateFormat;

    } catch (error) {
      return "";
    };
  };
// // // // // // // // // // // // // // // //

// Formulario exersice
  exerciseForm.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (
      userID.value !== '' &&
      exersice.value !== '' &&
      duration.value !== '' &&
      date.value !== ''
    ) {
      const urlpost = `/api/users/${userID.value}/exercises`;
      exerciseForm.action = urlpost;
      exerciseForm.submit()
    };
  });


// DOMContentLoaded END
});
