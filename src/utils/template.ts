import { Game } from '@models/game.model';
import { App, normalizePath, Notice, TFile } from 'obsidian';

export async function getTemplateContents(app: App, templatePath: string | undefined): Promise<string> {
  const { metadataCache, vault } = app;
  const normalizedTemplatePath = normalizePath(templatePath ?? '');
  if (templatePath === '/') {
    return Promise.resolve('');
  }

  try {
    const templateFile = metadataCache.getFirstLinkpathDest(normalizedTemplatePath, '');
    return templateFile ? vault.cachedRead(templateFile) : '';
  } catch (err) {
    console.error(`Failed to read the daily note template '${normalizedTemplatePath}'`, err);
    new Notice('Failed to read the daily note template');
    return '';
  }
}

export function applyTemplateTransformations(rawTemplateContents: string): string {
  return rawTemplateContents.replace(
    /{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi,
    (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
      const now = window.moment();
      const currentDate = window
        .moment()
        .clone()
        .set({
          hour: now.get('hour'),
          minute: now.get('minute'),
          second: now.get('second'),
        });
      if (calc) {
        currentDate.add(parseInt(timeDelta, 10), unit);
      }

      if (momentFormat) {
        return currentDate.format(momentFormat.substring(1).trim());
      }
      return currentDate.format('YYYY-MM-DD');
    },
  );
}

export function executeInlineScriptsTemplates(game: Game, text: string) {
  const commandRegex = /<%(?:=)(.+)%>/g;
  const ctor = getFunctionConstructor();
  const matchedList = [...text.matchAll(commandRegex)];
  return matchedList.reduce((result, [matched, script]) => {
    try {
      const outputs = new ctor(
        [
          'const [game] = arguments',
          `const output = ${script}`,
          'if(typeof output === "string") return output',
          'return JSON.stringify(output)',
        ].join(';'),
      )(game);
      return result.replace(matched, outputs);
    } catch (err) {
      console.warn(err);
    }
    return result;
  }, text);
}

export function getFunctionConstructor(): typeof Function {
  try {
    return new Function('return (function(){}).constructor')();
  } catch (err) {
    console.warn(err);
    if (err instanceof SyntaxError) {
      throw Error('Bad template syntax');
    } else {
      throw err;
    }
  }
}

export async function useTemplaterPluginInFile(app: App, file: TFile) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templater = (app as any).plugins.plugins['templater-obsidian'];
  if (templater && !templater?.settings['trigger_on_file_creation']) {
    await templater.templater.overwrite_file_commands(file);
  }
}
