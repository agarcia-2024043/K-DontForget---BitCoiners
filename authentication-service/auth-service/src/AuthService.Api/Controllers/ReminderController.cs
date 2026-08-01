using AuthService.Application.Interfaces;
using AuthService.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

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
    private readonly IReminderService _reminderService;

    public RemindersController(IReminderService reminderService)
    {
        _reminderService = reminderService;
    }

    /// <summary>
    /// Obtener todos los recordatorios pendientes.
    /// </summary>
    /// <returns>Lista de recordatorios pendientes.</returns>
    /// <response code="200">Lista de recordatorios pendientes retornada correctamente.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Reminder>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReminders()
    {
        var reminders = await _reminderService.GetPendingRemindersAsync();
        return Ok(reminders);
    }

    /// <summary>
    /// Crear un nuevo recordatorio.
    /// </summary>
    /// <param name="reminder">Datos del recordatorio a crear.</param>
    /// <returns>Recordatorio creado con estado Pending.</returns>
    /// <response code="200">Recordatorio creado correctamente.</response>
    /// <response code="400">Datos inválidos.</response>
    [HttpPost]
    [ProducesResponseType(typeof(Reminder), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateReminder(Reminder reminder)
    {
        var created = await _reminderService.CreateReminderAsync(reminder);
        return Ok(created);
    }

    /// <summary>
    /// Confirmar asistencia a una cita mediante su recordatorio.
    /// </summary>
    /// <param name="id">ID del recordatorio a confirmar.</param>
    /// <returns>Recordatorio actualizado con estado Confirmed.</returns>
    /// <response code="200">Asistencia confirmada correctamente.</response>
    /// <response code="404">Recordatorio no encontrado.</response>
    [HttpPost("confirm/{id}")]
    [ProducesResponseType(typeof(Reminder), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmAttendance(int id)
    {
        var reminder = await _reminderService.ConfirmAttendanceAsync(id);

        if (reminder == null)
            return NotFound();

        return Ok(reminder);
    }
}