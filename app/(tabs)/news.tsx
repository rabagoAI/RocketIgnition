import {
  View, Text, FlatList, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNews } from '@/src/hooks/useNews';
import { Colors, Spacing, Radii } from '@/src/lib/theme';
import type { NewsArticle } from '@/src/types/news';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ArticleCard({ article }: { article: NewsArticle }) {
  function handlePress() {
    Linking.openURL(article.url);
  }

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handlePress}>
      {article.image_url ? (
        <Image source={{ uri: article.image_url }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderIcon}>🛸</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.meta}>
          <Text style={styles.source}>{article.news_site}</Text>
          <Text style={styles.date}>{formatDate(article.published_at)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={3}>{article.title}</Text>
        {article.summary ? (
          <Text style={styles.summary} numberOfLines={2}>{article.summary}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const { articles, loading, loadingMore, error, hasMore, refetch, loadMore } = useNews();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <ArticleCard article={item} />}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + Spacing.md }]}
        showsVerticalScrollIndicator={false}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <Text style={styles.header}>Noticias espaciales</Text>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={Colors.primary} style={styles.footerSpinner} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center', padding: Spacing.lg,
  },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  header: {
    color: Colors.textPrimary, fontSize: 20, fontWeight: '700',
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: { width: '100%', height: 180 },
  imagePlaceholder: {
    width: '100%', height: 120,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 40 },
  cardBody: { padding: Spacing.md },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  source: {
    color: Colors.accent, fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  date: { color: Colors.textMuted, fontSize: 11 },
  title: {
    color: Colors.textPrimary, fontSize: 15, fontWeight: '600',
    lineHeight: 22, marginBottom: Spacing.xs,
  },
  summary: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  errorText: {
    color: Colors.textSecondary, fontSize: 15,
    textAlign: 'center', marginBottom: Spacing.md,
  },
  retryBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, borderRadius: Radii.sm,
  },
  retryText: { color: Colors.white, fontWeight: '600' },
  footerSpinner: { paddingVertical: Spacing.lg },
});
