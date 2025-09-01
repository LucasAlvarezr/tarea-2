// Import necessary modules for console interaction (if needed, but we'll use console directly)
// For dates, we'll use Date object

// Clase Autor
class Autor {
    constructor(
        public nombre: string,
        public biografia: string,
        public anoNacimiento: number
    ) {}
}

// Clase Libro
class Libro {
    public disponible: boolean = true;
    public reservas: Socio[] = []; // Cola de reservas (FIFO)
    public prestamoActual?: Prestamo; // Préstamo actual si está prestado

    constructor(
        public titulo: string,
        public autor: Autor,
        public isbn: string
    ) {}

    // Reservar el libro
    reservar(socio: Socio) {
        if (!this.disponible && !this.reservas.includes(socio)) {
            this.reservas.push(socio);
            console.log(`Socio ${socio.nombre} ha reservado el libro "${this.titulo}".`);
        } else {
            console.log(`El libro "${this.titulo}" ya está disponible o ya tienes una reserva.`);
        }
    }

    // Procesar disponibilidad después de devolución
    procesarReservas() {
        if (this.reservas.length > 0) {
            const socio = this.reservas.shift()!; // Sacar el primero de la cola
            console.log(`Notificación: El libro "${this.titulo}" está disponible para ${socio.nombre}.`);
            // Aquí se podría prestar automáticamente, pero por simplicidad, solo notificamos
        }
    }
}

// Clase Prestamo (para manejar fechas y multas)
class Prestamo {
    public fechaPrestamo: Date;
    public fechaVencimiento: Date;
    public multaPendiente: number = 0;

    constructor(
        public libro: Libro,
        public socio: Socio,
        diasPrestamo: number = 14 // Por defecto 14 días
    ) {
        this.fechaPrestamo = new Date();
        this.fechaVencimiento = new Date(this.fechaPrestamo);
        this.fechaVencimiento.setDate(this.fechaVencimiento.getDate() + diasPrestamo);
    }

    // Calcular multa
    calcularMulta(fechaActual: Date = new Date()): number {
        if (fechaActual > this.fechaVencimiento) {
            const diasRetraso = Math.floor((fechaActual.getTime() - this.fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));
            return diasRetraso * 50; // $50 por día
        }
        return 0;
    }
}

// Clase Socio
class Socio {
    public prestamosActuales: Prestamo[] = [];
    public historialLectura: Libro[] = []; // Historial completo de libros leídos
    public multasPendientes: number = 0;
    public eventosRegistrados: EventoBiblioteca[] = [];

    constructor(
        public nombre: string,
        public id: string
    ) {}

    // Pagar multas
    pagarMultas() {
        if (this.multasPendientes > 0) {
            console.log(`Socio ${this.nombre} ha pagado $${this.multasPendientes} en multas.`);
            this.multasPendientes = 0;
        } else {
            console.log(`Socio ${this.nombre} no tiene multas pendientes.`);
        }
    }

    // Registrar en evento
    registrarEvento(evento: EventoBiblioteca) {
        if (!this.eventosRegistrados.includes(evento)) {
            this.eventosRegistrados.push(evento);
            console.log(`Socio ${this.nombre} se ha registrado en el evento "${evento.nombre}".`);
        }
    }

    // Recibir recomendaciones
    obtenerRecomendaciones(biblioteca: Biblioteca): Libro[] {
        const autoresLeidos = new Set(this.historialLectura.map(libro => libro.autor.nombre));
        const titulosLeidos = this.historialLectura.map(libro => libro.titulo.toLowerCase());

        const recomendaciones: Libro[] = [];

        biblioteca.libros.forEach(libro => {
            if (this.historialLectura.includes(libro) || this.prestamosActuales.some(p => p.libro === libro)) {
                return; // No recomendar lo ya leído o prestado
            }

            // Basado en autor
            if (autoresLeidos.has(libro.autor.nombre)) {
                recomendaciones.push(libro);
                return;
            }

            // Basado en similitud de título (simple: contiene alguna palabra)
            const palabrasTitulo = libro.titulo.toLowerCase().split(' ');
            if (titulosLeidos.some(titulo => palabrasTitulo.some(palabra => titulo.includes(palabra)))) {
                recomendaciones.push(libro);
            }
        });

        return recomendaciones;
    }
}

// Clase EventoBiblioteca
class EventoBiblioteca {
    constructor(
        public nombre: string,
        public fecha: Date,
        public descripcion: string
    ) {}

    // Notificar a registrados (simulado)
    notificarRegistrados() {
        console.log(`Notificación para evento "${this.nombre}" en fecha ${this.fecha.toDateString()}.`);
        // En un sistema real, iteraría sobre registrados, pero como no los tenemos centralizados, se maneja por socio
    }
}

// Clase Biblioteca
class Biblioteca {
    public libros: Libro[] = [];
    public socios: Socio[] = [];
    public autores: Autor[] = [];
    public eventos: EventoBiblioteca[] = [];

    // Agregar libro
    agregarLibro(libro: Libro) {
        this.libros.push(libro);
        if (!this.autores.includes(libro.autor)) {
            this.autores.push(libro.autor);
        }
        console.log(`Libro "${libro.titulo}" agregado a la biblioteca.`);
    }

    // Agregar socio
    agregarSocio(socio: Socio) {
        this.socios.push(socio);
        console.log(`Socio ${socio.nombre} agregado a la biblioteca.`);
    }

    // Prestar libro
    prestarLibro(isbn: string, idSocio: string) {
        const libro = this.libros.find(l => l.isbn === isbn);
        const socio = this.socios.find(s => s.id === idSocio);

        if (!libro || !socio) {
            console.log('Libro o socio no encontrado.');
            return;
        }

        if (!libro.disponible) {
            console.log(`El libro "${libro.titulo}" no está disponible.`);
            return;
        }

        if (socio.multasPendientes > 0) {
            console.log(`Socio ${socio.nombre} tiene multas pendientes y no puede prestar libros.`);
            return;
        }

        const prestamo = new Prestamo(libro, socio);
        socio.prestamosActuales.push(prestamo);
        libro.disponible = false;
        libro.prestamoActual = prestamo;
        console.log(`Libro "${libro.titulo}" prestado a ${socio.nombre}. Vence el ${prestamo.fechaVencimiento.toDateString()}.`);
    }

    // Devolver libro
    devolverLibro(isbn: string, idSocio: string) {
        const libro = this.libros.find(l => l.isbn === isbn);
        const socio = this.socios.find(s => s.id === idSocio);

        if (!libro || !socio || !libro.prestamoActual || libro.prestamoActual.socio !== socio) {
            console.log('Préstamo no encontrado.');
            return;
        }

        const prestamo = libro.prestamoActual;
        const multa = prestamo.calcularMulta();
        if (multa > 0) {
            socio.multasPendientes += multa;
            console.log(`Notificación: Multa de $${multa} por retraso en "${libro.titulo}".`);
        }

        socio.prestamosActuales = socio.prestamosActuales.filter(p => p !== prestamo);
        socio.historialLectura.push(libro);
        libro.disponible = true;
        libro.prestamoActual = undefined;
        console.log(`Libro "${libro.titulo}" devuelto por ${socio.nombre}.`);

        libro.procesarReservas();
    }

    // Encontrar libros por autor
    encontrarLibrosPorAutor(nombreAutor: string): Libro[] {
        return this.libros.filter(libro => libro.autor.nombre === nombreAutor);
    }

    // Agregar evento
    agregarEvento(evento: EventoBiblioteca) {
        this.eventos.push(evento);
        console.log(`Evento "${evento.nombre}" agregado.`);
    }

    // Notificar vencimientos (simulado, llamar periódicamente)
    notificarVencimientos() {
        this.socios.forEach(socio => {
            socio.prestamosActuales.forEach(prestamo => {
                if (new Date() > prestamo.fechaVencimiento && prestamo.multaPendiente === 0) {
                    const multa = prestamo.calcularMulta();
                    console.log(`Notificación a ${socio.nombre}: El libro "${prestamo.libro.titulo}" está vencido. Multa actual: $${multa}.`);
                    // Actualizar multa pendiente, pero se calcula en devolución
                }
            });
        });
    }

    // Notificar eventos próximos (simulado)
    notificarEventosProximos() {
        const hoy = new Date();
        this.eventos.forEach(evento => {
            const diasRestantes = Math.floor((evento.fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
            if (diasRestantes <= 3 && diasRestantes > 0) {
                console.log(`Notificación: Evento "${evento.nombre}" se acerca en ${diasRestantes} días.`);
                // Notificar a registrados
                this.socios.forEach(socio => {
                    if (socio.eventosRegistrados.includes(evento)) {
                        console.log(`- Para ${socio.nombre}`);
                    }
                });
            }
        });
    }

    // Consultar estado
    consultarEstado() {
        console.log('Estado de la Biblioteca:');
        console.log('Libros:');
        this.libros.forEach(libro => {
            console.log(`- "${libro.titulo}" por ${libro.autor.nombre} (ISBN: ${libro.isbn}) - Disponible: ${libro.disponible}`);
        });
        console.log('Socios:');
        this.socios.forEach(socio => {
            console.log(`- ${socio.nombre} (ID: ${socio.id}) - Multas: $${socio.multasPendientes}`);
            console.log('  Prestamos actuales: ' + socio.prestamosActuales.map(p => p.libro.titulo).join(', '));
            console.log('  Historial: ' + socio.historialLectura.map(l => l.titulo).join(', '));
        });
    }
}

// Ejemplo de uso (demostración por consola)
function main() {
    const biblioteca = new Biblioteca();

    // Crear autores
    const autor1 = new Autor('Gabriel García Márquez', 'Escritor colombiano, nobel de literatura.', 1927);
    const autor2 = new Autor('J.K. Rowling', 'Escritora británica, creadora de Harry Potter.', 1965);

    // Agregar libros
    biblioteca.agregarLibro(new Libro('Cien Años de Soledad', autor1, 'ISBN1'));
    biblioteca.agregarLibro(new Libro('El Amor en los Tiempos del Cólera', autor1, 'ISBN2'));
    biblioteca.agregarLibro(new Libro('Harry Potter y la Piedra Filosofal', autor2, 'ISBN3'));

    // Agregar socios
    biblioteca.agregarSocio(new Socio('Juan Perez', 'S001'));
    biblioteca.agregarSocio(new Socio('Maria Lopez', 'S002'));

    // Prestar libro
    biblioteca.prestarLibro('ISBN1', 'S001');

    // Intentar prestar con multa (primero no hay)
    // Simular retraso: Cambiar fecha vencimiento manualmente para demo
    const prestamo = biblioteca.socios[0].prestamosActuales[0];
    prestamo.fechaVencimiento = new Date(new Date().setDate(new Date().getDate() - 5)); // Vencido hace 5 días

    // Devolver con multa
    biblioteca.devolverLibro('ISBN1', 'S001');

    // Intentar prestar de nuevo sin pagar
    biblioteca.prestarLibro('ISBN2', 'S001'); // Debería fallar por multa

    // Pagar multas
    biblioteca.socios[0].pagarMultas();

    // Prestar de nuevo
    biblioteca.prestarLibro('ISBN2', 'S001');

    // Reservar un libro prestado
    const libroPrestado = biblioteca.libros[1]; // ISBN2 prestado
    libroPrestado.reservar(biblioteca.socios[1]); // Maria reserva

    // Devolver y procesar reserva
    biblioteca.devolverLibro('ISBN2', 'S001');

    // Encontrar libros por autor
    const librosAutor1 = biblioteca.encontrarLibrosPorAutor('Gabriel García Márquez');
    console.log('Libros de Gabriel García Márquez: ' + librosAutor1.map(l => l.titulo).join(', '));

    // Agregar evento
    const evento = new EventoBiblioteca('Club de Lectura: Realismo Mágico', new Date(new Date().setDate(new Date().getDate() + 2)), 'Discusión sobre obras de GGM.');
    biblioteca.agregarEvento(evento);

    // Registrar socio en evento
    biblioteca.socios[0].registrarEvento(evento);

    // Notificar eventos próximos
    biblioteca.notificarEventosProximos();

    // Notificar vencimientos (simular uno vencido)
    const prestamo2 = new Prestamo(biblioteca.libros[2], biblioteca.socios[1]);
    biblioteca.socios[1].prestamosActuales.push(prestamo2);
    prestamo2.libro.disponible = false;
    prestamo2.libro.prestamoActual = prestamo2;
    prestamo2.fechaVencimiento = new Date(new Date().setDate(new Date().getDate() - 1));
    biblioteca.notificarVencimientos();

    // Recomendaciones
    // Primero, agregar al historial (ya hay uno)
    const recomendaciones = biblioteca.socios[0].obtenerRecomendaciones(biblioteca);
    console.log('Recomendaciones para Juan: ' + recomendaciones.map(l => l.titulo).join(', '));

    // Consultar estado
    biblioteca.consultarEstado();
}

main();