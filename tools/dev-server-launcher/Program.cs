using System.Diagnostics;

Console.OutputEncoding = System.Text.Encoding.UTF8;

var servers = new[]
{
    new DevServer(
        Title: "orchard-5173",
        WorkingDirectory: @"C:\Users\Win11_UEFI\Desktop\과수 타이쿤",
        Command: "npm run dev:win",
        Url: "http://localhost:5173/",
        Port: 5173),
    new DevServer(
        Title: "wedding-3000",
        WorkingDirectory: @"F:\실험",
        Command: "npx vite --host 0.0.0.0 --port 3000",
        Url: "http://localhost:3000/",
        Port: 3000),
    new DevServer(
        Title: "sensor-3001",
        WorkingDirectory: @"C:\Users\Win11_UEFI\Desktop\Arduino\esp32_farm_monitor",
        Command: "npm run dev",
        Url: "http://localhost:3001/",
        Port: 3001)
};

var missingDirectories = servers
    .Where(server => !Directory.Exists(server.WorkingDirectory))
    .ToArray();

if (missingDirectories.Length > 0)
{
    Console.WriteLine("Cannot start dev servers. Missing directories:");
    foreach (var server in missingDirectories)
    {
        Console.WriteLine($"- {server.Title}: {server.WorkingDirectory}");
    }

    Console.WriteLine();
    Console.WriteLine("Press Enter to close.");
    Console.ReadLine();
    return 1;
}

var wtPath = ResolveExecutable("wt.exe");
if (wtPath is null)
{
    Console.WriteLine("Windows Terminal wt.exe was not found.");
    Console.WriteLine("Install Windows Terminal or start each command manually.");
    Console.WriteLine();
    Console.WriteLine("Press Enter to close.");
    Console.ReadLine();
    return 1;
}

var startInfo = new ProcessStartInfo
{
    FileName = wtPath,
    UseShellExecute = false
};

for (var index = 0; index < servers.Length; index++)
{
    if (index == 0)
    {
        startInfo.ArgumentList.Add("new-tab");
    }
    else
    {
        startInfo.ArgumentList.Add(";");
        startInfo.ArgumentList.Add("new-tab");
    }

    AddTerminalTabArguments(startInfo, servers[index]);
}

try
{
    Process.Start(startInfo);
}
catch (Exception error)
{
    Console.WriteLine("Failed to start Windows Terminal.");
    Console.WriteLine(error.Message);
    Console.WriteLine();
    Console.WriteLine("Press Enter to close.");
    Console.ReadLine();
    return 1;
}

Console.WriteLine("Started dev server tabs:");
foreach (var server in servers)
{
    Console.WriteLine($"- {server.Title}: {server.Url}");
}

return 0;

static void AddTerminalTabArguments(ProcessStartInfo startInfo, DevServer server)
{
    startInfo.ArgumentList.Add("--title");
    startInfo.ArgumentList.Add(server.Title);
    startInfo.ArgumentList.Add("-d");
    startInfo.ArgumentList.Add(server.WorkingDirectory);
    startInfo.ArgumentList.Add("powershell");
    startInfo.ArgumentList.Add("-NoExit");
    startInfo.ArgumentList.Add("-ExecutionPolicy");
    startInfo.ArgumentList.Add("Bypass");
    startInfo.ArgumentList.Add("-Command");
    startInfo.ArgumentList.Add(BuildPortAwarePowerShellCommand(server));
}

static string BuildPortAwarePowerShellCommand(DevServer server)
{
    return "$port = " + server.Port + "; " +
        "if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { " +
        "Write-Host ('Port ' + $port + ' is already in use. Server may already be running.'); " +
        "Write-Host '" + server.Url + "'; " +
        "} else { " + server.Command + " }";
}

static string? ResolveExecutable(string executableName)
{
    var pathValue = Environment.GetEnvironmentVariable("PATH") ?? "";
    foreach (var directory in pathValue.Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries))
    {
        try
        {
            var candidate = Path.Combine(directory.Trim(), executableName);
            if (File.Exists(candidate))
            {
                return candidate;
            }
        }
        catch
        {
            // Ignore malformed PATH entries.
        }
    }

    var windowsAppsCandidate = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "Microsoft",
        "WindowsApps",
        executableName);

    return File.Exists(windowsAppsCandidate) ? windowsAppsCandidate : null;
}

internal sealed record DevServer(
    string Title,
    string WorkingDirectory,
    string Command,
    string Url,
    int Port);

