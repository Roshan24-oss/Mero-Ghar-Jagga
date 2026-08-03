const calculateTrending = (property) => {

    const views = property.views || 0;

    const likes = property.likesCount || 0;

    const favorites = property.favoritesCount || 0;

    const comments = property.comments?.length || 0;

    const unlocks = property.unlockCount || 0;

    const score =
        (views * 5) +
        (likes * 10) +
        (favorites * 20) +
        (comments * 25) +
        (unlocks * 50);

    return {
        score,
        isTrending: score >= 30
    };
};

export default calculateTrending;                                                             