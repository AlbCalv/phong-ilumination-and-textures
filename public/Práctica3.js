// ****************** Variables Globales
  let   gl = null,
        canvas = null,
        glProgram = null,
        fragmentShader = null,
        vertexShader = null;

  let   positionLocatAttrib =null;
  let   colorLocatAttrib=null;
  let   textureLocatAttrib=null;
  let   normalesLocatAttrib=null;

   // COORDENADAS VERTICES
  let   vertices=null;
  let   verticeBuffer = null;

  // COLORES
  let   verticeColors=null,
        colorBuffer=null;
  // NORMALES
  let   normales=null,
        normalesBuffer=null;

    // TEXTURAS
    let textureCoord, texture,texBuffer;
    let uTexture;

    // MATERIALES
    var MATERIALS = {
             Rubik : {
                 nombre : "Rubik",
                 ruta : "./texturas/rubik.png",
             },

             Kiwi : {
                 name : "Kiwi",
                 ruta : "./texturas/kiwi.png",
             },

             Grieta : {
                 name : "Grieta",
                 ruta : "./texturas/grieta.png",
             },
     };
     // MATERIAL ACTUAL
    var materialactual=MATERIALS.Grieta;

    //ROTACIÃN
    let ratonAbajo = false;
    let posRatonX = null;
    let posRatonY = null;


    let MvMatrix=null;

    let uMvMatrix=null;

    // LUZ AMBIENTE
    var r=0,
        g=0,
        b=0;

    // DIRECCIÃN LUZ DIFUSA
    var lightDirection;
    var dx=0.0,
        dy=3.0,
        dz=2.0;
    // COLORES LUZ DIFUSA
    var rdifu=0.5,
        gdifu=0.5,
        bdifu=0.5;



/********************* 0. UTILIDADES **************************************/
  /******   Funciones de inicializaciÃ³n de matrices  ********* */

      function inicializarMatrices(){
      	MvMatrix=mat4.create();

      	mat4.identity(MvMatrix);

        mat4.lookAt(MvMatrix,[0.1,0.1,0.1],[0.3,0.5,-0.3],[0.1,0.1,0.1]);
      }
/*********************** RATON Y TECLADO: Funciones de control del Movimiento y RotaciÃ³n***/
	/* Deteccion de eventos*/

      function deteccionEventos(){
      	canvas.onmousedown=pulsaRatonAbajo;
      	document.onmouseup=pulsaRatonArriba;
      	document.onmousemove=mueveRaton;
      }
     /* Gestion de eventos*/

     function pulsaRatonAbajo(event) {
        ratonAbajo = true;
        posRatonX = event.clientX;
        posRatonY = event.clientY;
    }

    function pulsaRatonArriba(event) {
        ratonAbajo = false;
    }

    function mueveRaton(event) {
        if (!ratonAbajo) {
            return;
        }
        let nuevaX = event.clientX;
        let nuevaY = event.clientY;
        let deltaX = nuevaX - posRatonX;
        let deltaY = nuevaY - posRatonY;

        let idMatrix=mat4.create();

        mat4.rotate(idMatrix,idMatrix,degToRad(deltaX/2), [0,1,0]);
        mat4.rotate(idMatrix,idMatrix,degToRad(deltaY/2), [1,0,0]);

        mat4.multiply(MvMatrix, MvMatrix,idMatrix );
        posRatonX = nuevaX;
        posRatonY = nuevaY;
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }



/********************* 1. INIT WEBGL **************************************/
function initWebGL()
      {
        canvas = document.getElementById("canvas");
        gl = canvas.getContext("webgl");

        if(gl)
        {
          setupWebGL();
          initShaders();
          inicializarSliders();
          deteccionEventos();
          setupBuffers();
          setTexturas();
          drawScene();
          animacion();
        }
        else{
          alert("El navegador no soporta WEBGL.");
        }
      }
      /********************* 2.setupWEBGL **************************************/
      function setupWebGL()
      {
        //Pone el color de fondo a verde ---para 2d no funciona
        gl.clearColor(0.5, 0.5, 0.5, 0.5);

        //Crea un viewport del tamaÃ±o del canvas
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Modo ON DEPTH
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        //Inicializarmatrices de movimeinto
        inicializarMatrices();

        //gl.enable ACTIVA una serie de caracteristicas tan variadas como:
        // a) Mezcla de colores (pordefecto estÃ¡ activado)
        gl.disable(gl.BLEND);
        // b) CullFace (me desaparecen tres triangulos o no, jugar con el CCW y EL CW)
        gl.disable(gl.CULL_FACE);

      }
      /********************* 3. INIT SHADER **************************************/
      function initShaders()
      {
       // Esta funciÃ³n inicializa los shaders

        //1.Obtengo la referencia de los shaders
        let fs_source = document.getElementById('fragment-shader').innerHTML;
        let vs_source = document.getElementById('vertex-shader').innerHTML;

        //2. Compila los shaders
        vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
        fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);

          //3. Crea un programa
          glProgram = gl.createProgram();

        //4. Adjunta al programa cada shader
          gl.attachShader(glProgram, vertexShader);
          gl.attachShader(glProgram, fragmentShader);
          gl.linkProgram(glProgram);

        if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
           alert("No se puede inicializar el Programa .");
          }

        //5. Usa el programa
        gl.useProgram(glProgram);
      }
     /********************* 3.1. MAKE SHADER **************************************/
      function makeShader(src, type)
      {
        //Compila cada  shader
        let shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
              alert("Error de compilaciÃ³n del shader: " + gl.getShaderInfoLog(shader));
          }
        return shader;
      }

      /****************** Set Texture ********************/

      function setTexture(texture){
      	gl.bindTexture(gl.TEXTURE_2D,texture);
	     	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE, texture.image );
    		// parÃ¡metros de filtrado
  			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    		// parÃ¡metros de repeticiÃ³n (ccordenadas de textura mayores a uno)
  			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    		// creaciÃ³n del mipmap
  			gl.generateMipmap(gl.TEXTURE_2D);
      }
     /********************* 4 SETUP BUFFERS  **************************************/
      function setupBuffers()
      {
        // VERTICES
          vertices = [

              //Frente
              -0.3, 0.3, 0.3, 0.3, 0.3, 0.3,  -0.3,-0.3, 0.3,
              -0.3,-0.3, 0.3, 0.3, 0.3, 0.3, 0.3, -0.3, 0.3,
              //Derecha
               0.3, 0.3, 0.3,   0.3,0.3, -0.3,   0.3,-0.3,0.3,
               0.3, -0.3, 0.3,   0.3,0.3, -0.3,   0.3,-0.3,-0.3,
               //Arriba
               0.3, 0.3, 0.3,   -0.3, 0.3,0.3,  0.3, 0.3,-0.3,
               0.3, 0.3, -0.3,   -0.3, 0.3,0.3,  -0.3, 0.3,-0.3,
               //Izquierda
               -0.3, 0.3,-0.3, -0.3, 0.3, 0.3,    -0.3,-0.3,-0.3,
               -0.3, -0.3, -0.3,  -0.3, 0.3,0.3,  -0.3,-0.3,0.3,
               //Abajo
               -0.3,-0.3,0.3,   0.3,-0.3,0.3,   -0.3,-0.3, -0.3,
               -0.3,-0.3,-0.3,   0.3,-0.3,0.3,   0.3,-0.3, -0.3,
               //DetrÃ¡s
               0.3, 0.3,-0.3,  -0.3,0.3,-0.3,  0.3,-0.3,-0.3,
               0.3, -0.3,-0.3,  -0.3,0.3,-0.3,  -0.3,-0.3,-0.3,


               //PICOS DE ARRIBA

               //Frente
               -0.2, 0.4, 0.2, 0.2, 0.4, 0.2,  -0.2,0.3, 0.2,
               -0.2, 0.3, 0.2, 0.2, 0.4, 0.2, 0.2, 0.3, 0.2,
               //Derecha
                0.2, 0.4, 0.2,   0.2,0.4, -0.2,   0.2,0.3,0.2,
                0.2, 0.3, 0.2,   0.2,0.4, -0.2,   0.2,0.3,-0.2,
                //Arriba
                0.2, 0.4, 0.2,   -0.2, 0.4,0.2,  0.2, 0.4,-0.2,
                0.2, 0.4, -0.2,   -0.2, 0.4,0.2,  -0.2, 0.4,-0.2,
                //Izquierda
                -0.2, 0.4,-0.2, -0.2, 0.4, 0.2,    -0.2,0.3,-0.2,
                -0.2, 0.3, -0.2,  -0.2, 0.4,0.2,  -0.2,0.3,0.2,
                //Abajo
                -0.2,0.3,0.2,   0.2,0.3,0.2,   -0.2,0.3, -0.2,
                -0.2,0.3,-0.2,   0.2,0.3,0.2,   0.2,0.3, -0.2,
                //DetrÃ¡s
                0.2, 0.4,-0.2,  -0.2,0.4,-0.2,  0.2,0.3,-0.2,
                0.2, 0.3,-0.2,  -0.2,0.4,-0.2,  -0.2,0.3,-0.2,

                //Frente
                -0.1, 0.5, 0.1, 0.1, 0.5, 0.1,  -0.1,0.4, 0.1,
                -0.1, 0.4, 0.1, 0.1, 0.5, 0.1, 0.1, 0.4, 0.1,
                //Derecha
                 0.1, 0.5, 0.1,   0.1,0.5, -0.1,   0.1,0.4,0.1,
                 0.1, 0.4, 0.1,   0.1,0.5, -0.1,   0.1,0.4,-0.1,
                 //Arriba
                 0.1, 0.5, 0.1,   -0.1, 0.5,0.1,  0.1, 0.5,-0.1,
                 0.1, 0.5, -0.1,   -0.1, 0.5,0.1,  -0.1, 0.5,-0.1,
                 //Izquierda
                 -0.1, 0.5,-0.1, -0.1, 0.5, 0.1,    -0.1,0.4,-0.1,
                 -0.1, 0.4, -0.1,  -0.1, 0.5,0.1,  -0.1,0.4,0.1,
                 //Abajo
                 -0.1,0.4,0.1,   0.1,0.4,0.1,   -0.1,0.4, -0.1,
                 -0.1,0.4,-0.1,   0.1,0.4,0.1,   0.1,0.4, -0.1,
                 //DetrÃ¡s
                 0.1, 0.5,-0.1,  -0.1,0.5,-0.1,  0.1,0.4,-0.1,
                 0.1, 0.4,-0.1,  -0.1,0.5,-0.1,  -0.1,0.4,-0.1,


                 //PICOS DE ABAJO

                 //Frente
                 -0.2, -0.4, 0.2, 0.2, -0.4, 0.2,  -0.2,-0.3, 0.2,
                 -0.2, -0.3, 0.2, 0.2, -0.4, 0.2, 0.2, -0.3, 0.2,
                 //Derecha
                  0.2, -0.4, 0.2,   0.2,-0.4, -0.2,   0.2,-0.3,0.2,
                  0.2, -0.3, 0.2,   0.2,-0.4, -0.2,   0.2,-0.3,-0.2,
                  //Arriba
                  0.2, -0.4, 0.2,   -0.2, -0.4,0.2,  0.2, -0.4,-0.2,
                  0.2, -0.4, -0.2,   -0.2, -0.4,0.2,  -0.2, -0.4,-0.2,
                  //Izquierda
                  -0.2, -0.4,-0.2, -0.2, -0.4, 0.2,    -0.2,-0.3,-0.2,
                  -0.2, -0.3, -0.2,  -0.2, -0.4,0.2,  -0.2,-0.3,0.2,
                  //Abajo
                  -0.2,-0.3,0.2,   0.2,-0.3,0.2,   -0.2,-0.3, -0.2,
                  -0.2,-0.3,-0.2,   0.2,-0.3,0.2,   0.2,-0.3, -0.2,
                  //DetrÃ¡s
                  0.2, -0.4,-0.2,  -0.2,-0.4,-0.2,  0.2,-0.3,-0.2,
                  0.2, -0.3,-0.2,  -0.2,-0.4,-0.2,  -0.2,-0.3,-0.2,


                  //Frente
                  -0.1, -0.5, 0.1, 0.1, -0.5, 0.1,  -0.1,-0.4, 0.1,
                  -0.1, -0.4, 0.1, 0.1, -0.5, 0.1, 0.1, -0.4, 0.1,
                  //Derecha
                   0.1, -0.5, 0.1,   0.1,-0.5, -0.1,   0.1,-0.4,0.1,
                   0.1, -0.4, 0.1,   0.1,-0.5, -0.1,   0.1,-0.4,-0.1,
                   //Arriba
                   0.1, -0.5, 0.1,   -0.1, -0.5,0.1,  0.1, -0.5,-0.1,
                   0.1, -0.5, -0.1,   -0.1, -0.5,0.1,  -0.1, -0.5,-0.1,
                   //Izquierda
                   -0.1, -0.5,-0.1, -0.1, -0.5, 0.1,    -0.1,-0.4,-0.1,
                   -0.1, -0.4, -0.1,  -0.1, -0.5,0.1,  -0.1,-0.4,0.1,
                   //Abajo
                   -0.1,-0.4,0.1,   0.1,-0.4,0.1,   -0.1,-0.4, -0.1,
                   -0.1,-0.4,-0.1,   0.1,-0.4,0.1,   0.1,-0.4, -0.1,
                   //DetrÃ¡s
                   0.1, -0.5,-0.1,  -0.1,-0.5,-0.1,  0.1,-0.4,-0.1,
                   0.1, -0.4,-0.1,  -0.1,-0.5,-0.1,  -0.1,-0.4,-0.1,
        ];
        // Buffer que almacena los vÃ©rtices
        verticeBuffer = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
       //Busca dÃ³nde debe ir la posicion de los vÃ©rtices en el programa.
       positionLocatAttrib = gl.getAttribLocation(glProgram, "aVertexPosition");
       gl.enableVertexAttribArray(positionLocatAttrib);
       //Enlazo con las posiciones de los vÃ©rtices
       gl.vertexAttribPointer(positionLocatAttrib, 3, gl.FLOAT, false, 0, 0);


       // Normal
       normales = [
         //
         0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,
         0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,

         0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,
         0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,

         0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,
         0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,

        -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,
        -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,

         0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,
         0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,

         0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,
         0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,

         //
         0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,
         0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,

         0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,
         0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,

         0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,
         0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,

        -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,
        -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,

         0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,
         0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,

         0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,
         0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,

         //
         0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,
         0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,

         0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,
         0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,

         0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,
         0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,

        -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,
        -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,

         0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,
         0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,

         0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,
         0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,

         //
         0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,
         0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,

         0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,
         0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,

         0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,
         0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,

        -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,
        -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,

         0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,
         0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,

         0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,
         0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,

         //
         0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,
         0.0, 0.0, 0.5,   0.0, 0.0, 0.5,   0.0, 0.0, 0.5,

         0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,
         0.5, 0.0, 0.0,   0.5, 0.0, 0.0,   0.5, 0.0, 0.0,

         0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,
         0.0, 0.5, 0.0,   0.0, 0.5, 0.0,   0.0, 0.5, 0.0,

        -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,
        -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,  -0.5, 0.0, 0.0,

         0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,
         0.0,-0.5, 0.0,   0.0,-0.5, 0.0,   0.0,-0.5, 0.0,

         0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,
         0.0, 0.0,-0.5,   0.0, 0.0,-0.5,   0.0, 0.0,-0.5,


       ];

      normalesBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalesBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normales), gl.STATIC_DRAW);
      //Busca dÃ³nde debe ir la posicion de los vÃ©rtices en el programa.
      normalesLocatAttrib = gl.getAttribLocation(glProgram, "aNormal");
      gl.enableVertexAttribArray(normalesLocatAttrib);
      //Enlazo con las posiciones de los vÃ©rtices
      gl.vertexAttribPointer(normalesLocatAttrib, 3, gl.FLOAT, false, 0, 0);


       /***********
       ** VARIABLES UNIFORMS
       ************/

        // Localiza la matriz en el glProgram
        uMvMatrix = gl.getUniformLocation(glProgram, 'uMvMatrix');
        uTexture=gl.getUniformLocation(glProgram,'uTexture');

        gl.uniform1i(uTexture,0);

        /**************
        ** LUCES
        **************/
        u_AmbientLight = gl.getUniformLocation(glProgram, 'u_AmbientLight');
        u_DiffuseLight = gl.getUniformLocation(glProgram, 'u_DiffuseLight');
        u_LightDirection = gl.getUniformLocation(glProgram, 'u_LightDirection');

        //Luz difusa
        lightDirection = new Vector3([dx, dy, dz]);
        lightDirection.normalize();     // Normalize
        gl.uniform3fv(u_LightDirection, lightDirection.elements);
        // Luz ambiente
        gl.uniform3f(u_AmbientLight, r, g, b);




      } //de la funcion

  function setTexturas(){

           /* *******************************
           ** 			TEXTURAS
           * *******************************/

           /****  PONER COORD TEXTURAS ***/

            textureCoord=[ //Comentarios para textura de cubo de rubik
              // Verde
              0,0,    0.25,0, 0,0.5,
              0,0.5,  0.25,0, 0.25,0.5,
              // Azul
              0.25,0,     0.5,0,    0.25, 0.5,
              0.25, 0.5,  0.5,0,    0.5 , 0.5,
              // Amarillo
              0.5,0,    0.75 , 0,   0.5, 0.5,
              0.5,0.5,  0.75, 0,    0.75, 0.5,
              // Rojo
              0,0.5,  0.25, 0.5,  0, 1,
              0,1,    0.25, 0.5,  0.25,1,
              // Blanco
              0.25, 0.5,  0.5, 0.5,  0.25 , 1,
              0.25, 1  ,  0.5 , 0.5  ,  0.5 , 1,
              // Naranja
              0.5 , 0.5,  0.75, 0.5,  0.5 , 1  ,
              0.5 , 1  ,  0.75, 0.5,  0.75, 1  ,

              // Verde
              0,0,    0.25,0, 0,0.5,
              0,0.5,  0.25,0, 0.25,0.5,
              // Azul
              0.25,0,     0.5,0,    0.25, 0.5,
              0.25, 0.5,  0.5,0,    0.5 , 0.5,
              // Amarillo
              0.5,0,    0.75 , 0,   0.5, 0.5,
              0.5,0.5,  0.75, 0,    0.75, 0.5,
              // Rojo
              0,0.5,  0.25, 0.5,  0, 1,
              0,1,    0.25, 0.5,  0.25,1,
              // Blanco
              0.25, 0.5,  0.5, 0.5,  0.25 , 1,
              0.25, 1  ,  0.5 , 0.5  ,  0.5 , 1,
              // Naranja
              0.5 , 0.5,  0.75, 0.5,  0.5 , 1  ,
              0.5 , 1  ,  0.75, 0.5,  0.75, 1  ,

              // Verde
              0,0,    0.25,0, 0,0.5,
              0,0.5,  0.25,0, 0.25,0.5,
              // Azul
              0.25,0,     0.5,0,    0.25, 0.5,
              0.25, 0.5,  0.5,0,    0.5 , 0.5,
              // Amarillo
              0.5,0,    0.75 , 0,   0.5, 0.5,
              0.5,0.5,  0.75, 0,    0.75, 0.5,
              // Rojo
              0,0.5,  0.25, 0.5,  0, 1,
              0,1,    0.25, 0.5,  0.25,1,
              // Blanco
              0.25, 0.5,  0.5, 0.5,  0.25 , 1,
              0.25, 1  ,  0.5 , 0.5  ,  0.5 , 1,
              // Naranja
              0.5 , 0.5,  0.75, 0.5,  0.5 , 1  ,
              0.5 , 1  ,  0.75, 0.5,  0.75, 1  ,

              // Verde
              0,0,    0.25,0, 0,0.5,
              0,0.5,  0.25,0, 0.25,0.5,
              // Azul
              0.25,0,     0.5,0,    0.25, 0.5,
              0.25, 0.5,  0.5,0,    0.5 , 0.5,
              // Blanco
              0.25, 0.5,  0.5, 0.5,  0.25 , 1,
              0.25, 1  ,  0.5 , 0.5  ,  0.5 , 1,

              // Rojo
              0,0.5,  0.25, 0.5,  0, 1,
              0,1,    0.25, 0.5,  0.25,1,
              // Amarillo
              0.5,0,    0.75 , 0,   0.5, 0.5,
              0.5,0.5,  0.75, 0,    0.75, 0.5,
              // Naranja
              0.5 , 0.5,  0.75, 0.5,  0.5 , 1  ,
              0.5 , 1  ,  0.75, 0.5,  0.75, 1  ,

              // Verde
              0,0,    0.25,0, 0,0.5,
              0,0.5,  0.25,0, 0.25,0.5,
              // Azul
              0.25,0,     0.5,0,    0.25, 0.5,
              0.25, 0.5,  0.5,0,    0.5 , 0.5,
              // Blanco
              0.25, 0.5,  0.5, 0.5,  0.25 , 1,
              0.25, 1  ,  0.5 , 0.5  ,  0.5 , 1,
              // Rojo
              0,0.5,  0.25, 0.5,  0, 1,
              0,1,    0.25, 0.5,  0.25,1,

              // Amarillo
              0.5,0,    0.75 , 0,   0.5, 0.5,
              0.5,0.5,  0.75, 0,    0.75, 0.5,
              // Naranja
              0.5 , 0.5,  0.75, 0.5,  0.5 , 1  ,
              0.5 , 1  ,  0.75, 0.5,  0.75, 1  ,

           ];


           /**** CREAR TEXTURA  *****/
          texture = gl.createTexture();
          texture.image=new Image();
          texture.image.onload = function(){
              setTexture(texture);
          }//de la funcion onload
          texture.image.src=materialactual.ruta;
  }

/********************* Draw Scene        *********************************** */
  function drawScene(){

      /*************
      ** TEXTURAS
      **************/

      /******* ACTIVACION DE TEXTURA ****/
      gl.activeTexture(gl.TEXTURE0);

      /**** CREAR BUFFER DE TEXTURA ***/
      texBuffer=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,texBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoord), gl.STATIC_DRAW);

      /**** LOCALIZAR ATRIBUTO TEXTURA ***/
      textureLocatAttrib = gl.getAttribLocation(glProgram, "aTexCoord");
      gl.enableVertexAttribArray(textureLocatAttrib);
      gl.bindBuffer(gl.ARRAY_BUFFER,texBuffer);
      gl.vertexAttribPointer(textureLocatAttrib,2,gl.FLOAT,false,0,0);

      /**************
      ** LUZ AMBIENTE
      ****************/
      red=gl.getUniformLocation(glProgram, "red");
      green=gl.getUniformLocation(glProgram, "green");
      blue=gl.getUniformLocation(glProgram, "blue");

      gl.uniform1f(red, r);
      gl.uniform1f(green, g);
      gl.uniform1f(blue, b);

      gl.uniform3f(u_AmbientLight, r, g, b);

      /**************
      ** LUZ DIFUSA
      ****************/
      difx=gl.getUniformLocation(glProgram, "difx");
      dify=gl.getUniformLocation(glProgram, "dify");
      difz=gl.getUniformLocation(glProgram, "difz");

      gl.uniform1f(difx, dx);
      gl.uniform1f(dify, dy);
      gl.uniform1f(difz, dz);

      rdif=gl.getUniformLocation(glProgram, "rdif");
      gdif=gl.getUniformLocation(glProgram, "gdif");
      bdif=gl.getUniformLocation(glProgram, "bdif");

      gl.uniform1f(rdif, rdifu);
      gl.uniform1f(gdif, gdifu);
      gl.uniform1f(bdif, bdifu);

      // Color luz difusa
      gl.uniform3f(u_DiffuseLight,rdifu,gdifu,bdifu);

      lightDirection = new Vector3([dx, dy, dz]);
      lightDirection.normalize();     // Normalize
      gl.uniform3fv(u_LightDirection,lightDirection.elements);


      gl.uniformMatrix4fv(uMvMatrix, false, MvMatrix);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3);

    }//de la funcion

    function animacion(){

        drawScene();
        requestAnimationFrame(animacion);
    }
