using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.Api.Data;
using AuthService.Api.Models;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador de recordatorios para citas de la Fundación Kinal.
/// Permite consultar, crear y confirmar asistencia a citas agendadas.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Reminders")]
public class RemindersController : ControllerBase
{
    private readonly AuthDbContext _context;

    public RemindersController(AuthDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Obtener todos los recordatorios pendientes.
    /// </summary>
    /// <remarks>
    /// Retorna la lista de recordatorios con estado "Pending".
    ///
    /// Ejemplo de respuesta:
    /// <code>
    /// [
    ///   {
    ///     "id": 1,
    ///     "status": "Pending",
    ///     "confirmed": false
    ///   }
    /// ]
    /// </code>
    /// </remarks>
    /// <returns>Lista de recordatorios pendientes.</returns>
    /// <response code="200">Lista de recordatorios pendientes retornada correctamente.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Reminder>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReminders()
    {
        var reminders = await _context.Reminders
            .Where(r => r.Status == "Pending")
            .ToListAsync();

        return Ok(reminders);
    }

    /// <summary>
    /// Crear un nuevo recordatorio.
    /// </summary>
    /// <remarks>
    /// Crea un recordatorio con estado inicial "Pending" y confirmación en false.
    ///
    /// Ejemplo de request:
    /// <code>
    /// {
    ///   "appointmentId": 5,
    ///   "email": "padre@kinal.edu.gt",
    ///   "scheduledAt": "2025-06-14T08:00:00Z"
    /// }
    /// </code>
    /// </remarks>
    /// <param name="reminder">Datos del recordatorio a crear.</param>
    /// <returns>Recordatorio creado con estado Pending.</returns>
    /// <response code="200">Recordatorio creado correctamente.</response>
    /// <response code="400">Datos inválidos.</response>
    [HttpPost]
    [ProducesResponseType(typeof(Reminder), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateReminder(Reminder reminder)
    {
        reminder.Status = "Pending";
        reminder.Confirmed = false;

        _context.Reminders.Add(reminder);
        await _context.SaveChangesAsync();

        return Ok(reminder);
    }

    /// <summary>
    /// Confirmar asistencia a una cita mediante su recordatorio.
    /// </summary>
    /// <remarks>
    /// Marca el recordatorio como confirmado y cambia su estado a "Confirmed".
    ///
    /// Ejemplo de respuesta exitosa:
    /// <code>
    /// {
    ///   "id": 1,
    ///   "status": "Confirmed",
    ///   "confirmed": true
    /// }
    /// </code>
    /// </remarks>
    /// <param name="id">ID del recordatorio a confirmar.</param>
    /// <returns>Recordatorio actualizado con estado Confirmed.</returns>
    /// <response code="200">Asistencia confirmada correctamente.</response>
    /// <response code="404">Recordatorio no encontrado.</response>
    [HttpPost("confirm/{id}")]
    [ProducesResponseType(typeof(Reminder), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmAttendance(int id)
    {
        var reminder = await _context.Reminders.FindAsync(id);

        if (reminder == null)
            return NotFound();

        reminder.Confirmed = true;
        reminder.Status = "Confirmed";

        await _context.SaveChangesAsync();

        return Ok(reminder);
    }
}