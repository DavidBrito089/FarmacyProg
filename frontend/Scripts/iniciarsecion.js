document.addEventListener('DOMContentLoaded',() =>{
    checkUserStatus();
    document.getElementById("log").addEventListener("click", async()=>{
        const email = document.getElementById("loginl").value;
        const password = document.getElementById("passwordl").value;
        try{
            const res = await fetch("http://localhost:3000/login", {
                method:"POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({email, password})
            })

            const data = await res.json();
            if(data.token){
                localStorage.setItem("token",data.token);
                checkUserStatus();
            }else{
                alert("usuario o cantasenia incorrectos")
            }

        }catch (e){
            console.error("Error:",e)
        }

    });

});


async function checkUserStatus() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    const userDisplay = document.getElementById('userDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const btnmyacc = document.getElementById('usuario');
    const modal = document.getElementById('modal');
    const carrito = document.getElementById('carrito')
    

    if (username) {
        userDisplay.textContent = `Hola, ${username}`;
        logoutBtn.style.display = 'inline-block';
    } else if (token) {

        const response = await fetch('http://localhost:3000/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });    
        
        const data = await response.json();
        if (response.ok) {      
            carrito.classList.remove("open-modal-btn");
            carrito.setAttribute("href","carrito.html");
            modal.classList.remove('show');
            btnmyacc.style.display = 'none';
            userDisplay.textContent = `${data.decoded.username}`;
            logoutBtn.style.display = 'inline-block';
        } else {
            console.log('Error obteniendo usuario:', data.error);
            localStorage.removeItem('token'); // Eliminar token si es inválido
        }
    }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload(); // Recargar la página para limpiar la sesión
});


function eliminarClaseDeTodosLosElementos(clase) {
    const elementos = document.querySelectorAll('.' + clase);
    for (let i = 0; i < elementos.length; i++) {
      elementos[i].classList.remove(clase);
    }
  }