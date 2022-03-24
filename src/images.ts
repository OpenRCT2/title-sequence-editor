enum ImageMoniker {
    Restart,
    Stop,
    Play,
    Skip,
}

var imageMap: number[] = [];

const allocateImages = () => {
    const images = [
        { width: 18, height: 17, data: 'IgAkACYAKAAqACwAMwA8AEcAUQBcAGUAbABuAHAAcgB0AIAAgACAAIAAgAABBQqCCwoKAQUKhAkKCgoKAQUKhgcKCgoKCgqIBQoKCgoKCgoKAQUKhgcKCgoKCgoBBQqECQoKCgoBBQqCCwoKgACAAIAAgACAAA==' },
        { width: 18, height: 17, data: 'IgAkACYAKAAqADQAPgBIAFIAXABmAHAAegCEAIYAiACKAIAAgACAAIAAiAUKCgoKCgoKCogFCgoKCgoKCgqIBQoKCgoKCgoKiAUKCgoKCgoKCogFCgoKCgoKCgqIBQoKCgoKCgoKiAUKCgoKCgoKCogFCgoKCgoKCgqIBQoKCgoKCgoKgACAAIAAgAA=' },
        { width: 18, height: 17, data: 'IgAkACYAKAAqACwAMAA2AD4ASABQAFYAWgBcAF4AYABiAIAAgACAAIAAgACCBQoKhAUKCgoKhgUKCgoKCgqIBQoKCgoKCgoKhgUKCgoKCgqEBQoKCgqCBQoKgACAAIAAgACAAA==' },
        { width: 18, height: 17, data: 'IgAkACYAKAAqADAAOABCAE4AWgBmAHAAeAB+AIAAggCEAIAAgACAAIAAAQQKgQkKAgQKCoIJCgoDBAoKCoMJCgoKBAQKCgoKhAkKCgoKigQKCgoKCgoKCgoKBAQKCgoKhAkKCgoKAwQKCgqDCQoKCgIECgqCCQoKAQQKgQkKgACAAIAAgAA=' },
    ];

    imageMap = Array(images.length);
    const range = ui.imageManager.allocate(images.length);
    if (range) {
        for (let i = 0; i < images.length; i++) {
            const imageIndex = range.start + i;
            const image = images[i];
            imageMap[i] = imageIndex;
            ui.imageManager.setPixelData(imageIndex, {
                type: 'rle',
                width: image.width,
                height: image.height,
                data: image.data
            });
        }
    }
};

const getImage = (moniker: ImageMoniker) => imageMap[moniker];
