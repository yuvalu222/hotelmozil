' run-hidden.vbs - runs a .cmd with no window (copied from HotelMozil/scripts, 2.10).
' The scheduled task calls wscript, which never opens a console; Run(..., 0) = hidden.
' usage:  wscript.exe //B //Nologo run-hidden.vbs "C:...launch.cmd"
If WScript.Arguments.Count < 1 Then WScript.Quit 1
Set sh = CreateObject("WScript.Shell")
WScript.Quit sh.Run("cmd.exe /c """ & WScript.Arguments(0) & """", 0, True)
