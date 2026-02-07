import fs from "fs";
import path from "path";
import RoadmapClient from "./RoadmapClient";

async function getRoadmapData() {
    const filePath = path.join(process.cwd(), "app/(root)/roadmap/docs/roadmap.md");
    const fileContent = fs.readFileSync(filePath, "utf8");

    const sections = fileContent.split(/\n## /);
    const intro = sections[0].replace(/^#.*\n/, '').trim();

    const milestones = sections.slice(1).map(section => {
        const lines = section.split('\n');
        const title = lines[0].trim();

        let description = '';
        let featureStartIndex = 1;
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].startsWith('- ')) {
                featureStartIndex = i;
                break;
            }
            if (lines[i].trim()) {
                description += lines[i].trim() + ' ';
            }
        }

        const features: { title: string; description: string; subItems: string[] }[] = [];
        let currentFeature: { title: string; description: string; subItems: string[] } | null = null;

        for (let i = featureStartIndex; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('- **')) {
                if (currentFeature) features.push(currentFeature);
                const match = line.match(/- \*\*([^*]+)\*\*/);
                const featureTitle = match ? match[1] : line.replace('- **', '').replace('**', '');
                const restOfLine = line.replace(/- \*\*[^*]+\*\*/, '').trim();
                currentFeature = {
                    title: featureTitle,
                    description: restOfLine,
                    subItems: []
                };
            } else if (line.trim().startsWith('- ') && currentFeature) {
                currentFeature.subItems.push(line.trim().replace('- ', ''));
            } else if (line.trim() && currentFeature && !line.startsWith('  -')) {
                currentFeature.description += ' ' + line.trim();
            }
        }
        if (currentFeature) features.push(currentFeature);

        const isCurrent = title.toLowerCase().includes("(hiện tại)") || title.toLowerCase().includes("current");

        return { title, description: description.trim(), features, isCurrent };
    });

    return { intro, milestones };
}

export default async function Roadmap() {
    const { intro, milestones } = await getRoadmapData();

    return <RoadmapClient intro={intro} milestones={milestones} />;
}
