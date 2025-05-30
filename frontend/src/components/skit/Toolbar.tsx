import { useSkitStore } from '../../store/skitStore';
import { Button } from '../ui/button';
import {
  Plus,
  Copy,
  Trash,
  Undo,
  Redo,
  Save,
  ChevronDown,
  FolderOpen,
  ClipboardPaste,
  Scissors
} from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { CommandDefinition } from '../../types';
import { toast } from 'sonner';
import { createCommandWithDefaults } from '../../utils/commandDefaults';
import { DraggableCommand } from '../dnd/DraggableCommand';
import { DropZone } from '../dnd/DropZone';
import { selectProjectFolder } from '../../utils/fileSystem';

export function Toolbar() {
  const {
    currentSkitId,
    selectedCommandIds,
    addCommand,
    moveCommand,
    removeCommands,
    copySelectedCommands,
    cutSelectedCommands,
    pasteCommandsFromClipboard,
    undo,
    redo,
    saveSkit,
    commandDefinitions,
    projectPath,
    setProjectPath,
    loadSkits,
    loadCommandsYaml
  } = useSkitStore();

  const handleAddCommand = (commandType: string) => {
    const commandDef = commandDefinitions.find((def: CommandDefinition) => def.id === commandType);
    if (!commandDef) return;

    const newCommand = createCommandWithDefaults(commandDef);
    addCommand(newCommand);

    if (selectedCommandIds.length > 0 && currentSkitId) {
      const lastSelectedId = selectedCommandIds[selectedCommandIds.length - 1];
      const state = useSkitStore.getState();
      const currentSkit = state.skits[currentSkitId];
      if (currentSkit) {
        const newIndex = currentSkit.commands.length - 1;
        const targetIndex = currentSkit.commands.findIndex(
          cmd => cmd.id === lastSelectedId
        );
        if (targetIndex !== -1) {
          moveCommand(newIndex, targetIndex + 1);
        }
      }
    }

    toast.success(`${commandDef.label}を追加しました`);
  };

  const handleSelectFolder = async () => {
    const selectedPath = await selectProjectFolder();
    if (selectedPath) {
      setProjectPath(selectedPath);
      
      try {
        const commandsYamlContent = await import('../../utils/fileSystem').then(
          module => module.loadCommandsYaml(selectedPath)
        );
        loadCommandsYaml(commandsYamlContent);
        
        const skits = await import('../../utils/fileSystem').then(
          module => module.loadSkits(selectedPath)
        );
        loadSkits(skits);
        
        toast.success('プロジェクトフォルダを読み込みました');
      } catch (error) {
        console.error('Failed to load project data:', error);
        toast.error('プロジェクトの読み込みに失敗しました');
      }
    }
  };

  const handleSave = async () => {
    try {
      await saveSkit();
      toast.success('スキットを保存しました');
    } catch (error) {
      toast.error(`保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const isDisabled = !currentSkitId;
  const isCommandSelected = selectedCommandIds.length > 0;

  return (
    <div className="flex items-center p-2 border-b w-full">
      <SidebarTrigger className="mr-2" />
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              disabled={isDisabled}
            >
              <Plus className="h-4 w-4" />
              追加
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {commandDefinitions.map((command: CommandDefinition) => (
              <DropdownMenuItem 
                key={command.id}
                onClick={() => handleAddCommand(command.id)}
              >
                <DraggableCommand id={command.id}>
                  <div className="flex items-center w-full">
                    {command.label}
                  </div>
                </DraggableCommand>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropZone id="copy-zone" className="inline-flex">
          <Button
            variant="outline"
            size="sm"
            disabled={!isCommandSelected}
            onClick={() => copySelectedCommands()}
          >
            <Copy className="h-4 w-4 mr-1" />
            コピー
          </Button>
        </DropZone>

        <Button
          variant="outline"
          size="sm"
          disabled={!isCommandSelected}
          onClick={() => cutSelectedCommands()}
        >
          <Scissors className="h-4 w-4 mr-1" />
          切り取り
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => pasteCommandsFromClipboard()}
        >
          <ClipboardPaste className="h-4 w-4 mr-1" />
          貼り付け
        </Button>

        <DropZone id="trash-zone" className="inline-flex">
          <Button 
            variant="outline" 
            size="sm"
            disabled={!isCommandSelected}
            onClick={() => selectedCommandIds.length > 0 && removeCommands(selectedCommandIds)}
          >
            <Trash className="h-4 w-4 mr-1" />
            削除
          </Button>
        </DropZone>
      </div>

      <div className="flex-1 flex items-center mx-2">
        {projectPath && (
          <div className="text-xs text-gray-500 truncate max-w-[200px]" title={projectPath}>
            {projectPath}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSelectFolder}
        title="プロジェクトフォルダを開く"
        className="mr-2"
      >
        <FolderOpen className="h-4 w-4 mr-1" />
        フォルダ
      </Button>

      <div className="ml-auto flex items-center">
        <Button
          variant="ghost"
          size="sm"
          disabled={isDisabled}
          onClick={undo}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={isDisabled}
          onClick={redo}
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Button
          variant="default"
          size="sm"
          disabled={isDisabled}
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-1" />
          保存
        </Button>
      </div>
    </div>
  );
}
