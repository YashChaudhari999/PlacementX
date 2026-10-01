# Fix AdminDashboardScreen.tsx
$file = "k:\assignment\PlacementX\PlacementX\apps\mobile\src\screens\admin\AdminDashboardScreen.tsx"
$content = [System.IO.File]::ReadAllText($file)

# Replace first ScrollView (Drives) with grid View
$content = $content.Replace(
  '<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollContent}>' + "`r`n" + '            <View style={styles.horizontalCardWrapper}>',
  '<View style={styles.cardsGrid}>' + "`r`n" + '            <View style={styles.cardGridItem}>'
)

# Replace remaining horizontalCardWrapper references with cardGridItem
$content = $content.Replace('<View style={styles.horizontalCardWrapper}>', '<View style={styles.cardGridItem}>')

# Replace closing </ScrollView> with </View> (only the ones that close horizontal scrolls in stat sections)
# The ScrollView closing tags at lines 142 and 278 should become </View>
$content = $content.Replace('          </ScrollView>', '          </View>')

# Add new styles after horizontalCardWrapper
$oldStyle = '  horizontalCardWrapper: {' + "`r`n" + '    width: width * 0.42,' + "`r`n" + '    marginRight: theme.spacing[4],' + "`r`n" + '  },'
$newStyle = '  horizontalCardWrapper: {' + "`r`n" + '    width: width * 0.42,' + "`r`n" + '    marginRight: theme.spacing[4],' + "`r`n" + '  },' + "`r`n" + '  cardsGrid: {' + "`r`n" + "    flexDirection: 'row'," + "`r`n" + "    flexWrap: 'wrap'," + "`r`n" + '    gap: theme.spacing[3],' + "`r`n" + '  },' + "`r`n" + '  cardGridItem: {' + "`r`n" + "    width: '47%'," + "`r`n" + '    marginBottom: theme.spacing[1],' + "`r`n" + '  },'

$content = $content.Replace($oldStyle, $newStyle)

[System.IO.File]::WriteAllText($file, $content)
Write-Output "Done: AdminDashboardScreen.tsx"
