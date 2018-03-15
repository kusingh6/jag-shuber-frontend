import * as Color from 'color';

export function getForegroundColor(backgroundColor: string): string {
    const color = Color(backgroundColor);

    // Counting the perceptive luminance - human eye favors green color... 
    const perceivedEnergy: number = 1 - (0.299 * color.red() + 0.587 * color.green() + 0.114 * color.blue()) / 255;

    if (perceivedEnergy < 0.5) {
        return '#000000'; // bright colors - black font
    } else {
        return '#FFFFFF'; // dark colors - white font
    }
}