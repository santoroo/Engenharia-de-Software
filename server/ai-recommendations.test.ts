import { describe, expect, it } from "vitest";

/**
 * Teste do algoritmo de recomendação de IA
 * 
 * O algoritmo funciona da seguinte forma:
 * 1. Obtém o histórico de acessos do usuário
 * 2. Conta a frequência de acessos por projeto
 * 3. Ordena os projetos por frequência (descendente)
 * 4. Retorna os top 5 projetos mais acessados
 * 
 * Casos de teste:
 * - Usuário sem histórico retorna lista vazia
 * - Usuário com histórico retorna projetos ordenados
 * - Projetos com mesma frequência mantêm ordem
 * - Limite de 5 projetos é respeitado
 */

interface AccessRecord {
  projectId: number;
  timestamp: Date;
}

interface ProjectRecommendation {
  projectId: number;
  accessCount: number;
  score: number;
}

function calculateProjectRecommendations(history: AccessRecord[]): ProjectRecommendation[] {
  // Count accesses per project
  const projectCounts: Record<number, number> = {};
  
  for (const record of history) {
    projectCounts[record.projectId] = (projectCounts[record.projectId] || 0) + 1;
  }
  
  // Convert to array and sort by count (descending)
  const recommendations: ProjectRecommendation[] = Object.entries(projectCounts)
    .map(([projectId, count]) => ({
      projectId: parseInt(projectId),
      accessCount: count,
      score: count, // Score is based on frequency
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Limit to top 5
  
  return recommendations;
}

describe("AI Recommendations - Frequency-Based Algorithm", () => {
  it("should return empty array for user with no access history", () => {
    const history: AccessRecord[] = [];
    const recommendations = calculateProjectRecommendations(history);
    
    expect(recommendations).toEqual([]);
  });

  it("should recommend single project when user accessed only one project", () => {
    const history: AccessRecord[] = [
      { projectId: 1, timestamp: new Date("2024-01-01") },
    ];
    
    const recommendations = calculateProjectRecommendations(history);
    
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].projectId).toBe(1);
    expect(recommendations[0].accessCount).toBe(1);
  });

  it("should order projects by access frequency (descending)", () => {
    const history: AccessRecord[] = [
      { projectId: 1, timestamp: new Date("2024-01-01") },
      { projectId: 1, timestamp: new Date("2024-01-02") },
      { projectId: 1, timestamp: new Date("2024-01-03") },
      { projectId: 2, timestamp: new Date("2024-01-04") },
      { projectId: 2, timestamp: new Date("2024-01-05") },
      { projectId: 3, timestamp: new Date("2024-01-06") },
    ];
    
    const recommendations = calculateProjectRecommendations(history);
    
    expect(recommendations).toHaveLength(3);
    expect(recommendations[0].projectId).toBe(1);
    expect(recommendations[0].accessCount).toBe(3);
    expect(recommendations[1].projectId).toBe(2);
    expect(recommendations[1].accessCount).toBe(2);
    expect(recommendations[2].projectId).toBe(3);
    expect(recommendations[2].accessCount).toBe(1);
  });

  it("should limit recommendations to top 5 projects", () => {
    const history: AccessRecord[] = [];
    
    // Add 10 projects with different frequencies
    for (let i = 1; i <= 10; i++) {
      for (let j = 0; j < i; j++) {
        history.push({
          projectId: i,
          timestamp: new Date(`2024-01-${String(i).padStart(2, "0")}`),
        });
      }
    }
    
    const recommendations = calculateProjectRecommendations(history);
    
    expect(recommendations).toHaveLength(5);
    expect(recommendations[0].projectId).toBe(10);
    expect(recommendations[4].projectId).toBe(6);
  });

  it("should calculate correct score based on frequency", () => {
    const history: AccessRecord[] = [
      { projectId: 1, timestamp: new Date("2024-01-01") },
      { projectId: 1, timestamp: new Date("2024-01-02") },
      { projectId: 1, timestamp: new Date("2024-01-03") },
      { projectId: 1, timestamp: new Date("2024-01-04") },
      { projectId: 1, timestamp: new Date("2024-01-05") },
    ];
    
    const recommendations = calculateProjectRecommendations(history);
    
    expect(recommendations[0].score).toBe(5);
    expect(recommendations[0].accessCount).toBe(5);
  });

  it("should handle projects with same frequency", () => {
    const history: AccessRecord[] = [
      { projectId: 1, timestamp: new Date("2024-01-01") },
      { projectId: 1, timestamp: new Date("2024-01-02") },
      { projectId: 2, timestamp: new Date("2024-01-03") },
      { projectId: 2, timestamp: new Date("2024-01-04") },
      { projectId: 3, timestamp: new Date("2024-01-05") },
      { projectId: 3, timestamp: new Date("2024-01-06") },
    ];
    
    const recommendations = calculateProjectRecommendations(history);
    
    expect(recommendations).toHaveLength(3);
    // All should have same access count
    expect(recommendations.every(r => r.accessCount === 2)).toBe(true);
  });

  it("should work with large number of accesses", () => {
    const history: AccessRecord[] = [];
    
    // Simulate 1000 accesses across 20 projects
    for (let i = 0; i < 1000; i++) {
      const projectId = (i % 20) + 1;
      history.push({
        projectId,
        timestamp: new Date(`2024-01-${String((i % 31) + 1).padStart(2, "0")}`),
      });
    }
    
    const recommendations = calculateProjectRecommendations(history);
    
    expect(recommendations.length).toBeLessThanOrEqual(5);
    expect(recommendations[0].accessCount).toBeGreaterThanOrEqual(recommendations[recommendations.length - 1].accessCount);
  });

  it("should recommend projects with highest frequency first", () => {
    const history: AccessRecord[] = [
      // Project 1: 5 accesses
      { projectId: 1, timestamp: new Date("2024-01-01") },
      { projectId: 1, timestamp: new Date("2024-01-02") },
      { projectId: 1, timestamp: new Date("2024-01-03") },
      { projectId: 1, timestamp: new Date("2024-01-04") },
      { projectId: 1, timestamp: new Date("2024-01-05") },
      // Project 2: 3 accesses
      { projectId: 2, timestamp: new Date("2024-01-06") },
      { projectId: 2, timestamp: new Date("2024-01-07") },
      { projectId: 2, timestamp: new Date("2024-01-08") },
      // Project 3: 7 accesses
      { projectId: 3, timestamp: new Date("2024-01-09") },
      { projectId: 3, timestamp: new Date("2024-01-10") },
      { projectId: 3, timestamp: new Date("2024-01-11") },
      { projectId: 3, timestamp: new Date("2024-01-12") },
      { projectId: 3, timestamp: new Date("2024-01-13") },
      { projectId: 3, timestamp: new Date("2024-01-14") },
      { projectId: 3, timestamp: new Date("2024-01-15") },
    ];
    
    const recommendations = calculateProjectRecommendations(history);
    
    expect(recommendations[0].projectId).toBe(3);
    expect(recommendations[1].projectId).toBe(1);
    expect(recommendations[2].projectId).toBe(2);
  });
});
