# Fix AdminNotificationsScreen.tsx - Move menu icon from left to right
$file = "k:\assignment\PlacementX\PlacementX\apps\mobile\src\screens\admin\AdminNotificationsScreen.tsx"
$lines = [System.IO.File]::ReadAllLines($file)

$newLines = New-Object System.Collections.Generic.List[string]
$skipUntilHeaderActionsClose = $false
$skipMenuBlock = $false
$menuInserted = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $trimmed = $line.Trim()
    
    # Skip the menu button that's in headerLeft (lines 181-183)
    if ($trimmed -eq '<TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuBtn}>') {
        # Check if we're inside headerLeft (before headerActions)
        # Look back a few lines to see if we're inside headerLeft
        $inHeaderLeft = $false
        for ($j = $i - 1; $j -ge [Math]::Max(0, $i - 5); $j--) {
            if ($lines[$j].Trim() -eq '<View style={styles.headerLeft}>') {
                $inHeaderLeft = $true
                break
            }
        }
        if ($inHeaderLeft) {
            # Skip this TouchableOpacity and its children (3 lines: open, icon, close)
            $i += 2  # skip <Menu .../> and </TouchableOpacity>
            continue
        }
    }
    
    # Find where to insert the menu button - right before </View> that closes headerActions
    if ($trimmed -eq '</View>' -and -not $menuInserted) {
        # Check if previous significant lines are part of headerActions
        $inHeaderActions = $false
        for ($j = $i - 1; $j -ge [Math]::Max(0, $i - 15); $j--) {
            if ($lines[$j].Trim() -eq '<View style={styles.headerActions}>') {
                $inHeaderActions = $true
                break
            }
            if ($lines[$j].Trim() -eq '<View style={styles.header}>') {
                break
            }
        }
        if ($inHeaderActions) {
            # Insert menu button before closing headerActions
            $indent = "          "
            $newLines.Add("$indent<TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuBtn}>")
            $newLines.Add("$indent  <Menu color={theme.colors.foreground} size={24} />")
            $newLines.Add("$indent</TouchableOpacity>")
            $menuInserted = $true
        }
    }
    
    $newLines.Add($line)
}

[System.IO.File]::WriteAllLines($file, $newLines.ToArray())
Write-Output "Done: AdminNotificationsScreen.tsx - menu moved to right side"
