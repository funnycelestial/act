import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const SpyDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-4 font-terminal text-foreground">
      {/* Header */}
      <div className="mb-6 border border-panel-border bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-foreground">█ CLASSIFIED OPERATIONS TERMINAL █</div>
          <div className="flex gap-4 text-sm">
            <span className="text-terminal-amber">1 Day</span>
            <span className="text-muted-foreground">1 Week</span>
            <span className="text-muted-foreground">1 Month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Agent Details */}
        <div className="col-span-3">
          <Card className="border-panel-border bg-card/50 p-4">
            <div className="mb-4 border-b border-panel-border pb-2">
              <h3 className="text-foreground">Agent Details</h3>
              <p className="text-xs text-muted-foreground">Detailed dossier of intelligence personnel</p>
            </div>
            
            <div className="mb-4">
              <div className="mb-2 h-16 w-16 border border-panel-border bg-secondary/20"></div>
              <div className="space-y-1 text-sm">
                <div className="text-foreground">AGENT 009X3312</div>
                <div>» AGE        : null</div>
                <div>» CODE NAME  : WHISSPERIA</div>
                <div>» ACTIVE UNTIL: 19/02/2040</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 text-foreground">Agent Activity</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold">72</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-terminal-green">45</div>
                  <div className="text-xs text-muted-foreground">Success</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-terminal-red">27</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">HIGH RISK</span>
                  <span className="text-xs text-terminal-red">30</span>
                </div>
                <Progress value={60} className="h-1" />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs">MEDIUM RISK</span>
                  <span className="text-xs text-muted-foreground">34</span>
                </div>
                <Progress value={40} className="h-1" />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs">LOW RISK</span>
                  <span className="text-xs text-terminal-green">08</span>
                </div>
                <Progress value={20} className="h-1" />
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-foreground">Brief Announcement...</h4>
              <div className="space-y-1 text-xs">
                <div>1231... 54.50</div>
                <div>2... 4.</div>
                <div>34... 87867</div>
                <div>4... 4.</div>
                <div>548... 4687.</div>
                <div>8.2...</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Panel - World Map & Operations */}
        <div className="col-span-6">
          <Card className="border-panel-border bg-card/50 p-4">
            <div className="mb-4">
              <h3 className="mb-2 text-foreground">Target Operation...</h3>
              
              {/* World Map Area */}
              <div className="relative h-96 border border-panel-border bg-background/50 p-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 text-6xl text-foreground">🌍</div>
                    <div className="text-foreground">GLOBAL SURVEILLANCE NETWORK</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Tracking 147 active operations worldwide
                    </div>
                  </div>
                </div>
                
                {/* USA Marker */}
                <div className="absolute left-1/4 top-1/3">
                  <div className="h-2 w-2 animate-pulse bg-terminal-red"></div>
                  <div className="text-xs text-terminal-red">USA</div>
                </div>
                
                {/* Africa Marker */}
                <div className="absolute bottom-1/3 right-1/3">
                  <div className="h-2 w-2 animate-pulse bg-foreground"></div>
                  <div className="text-xs text-foreground">AFRICA</div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                Intelligence confirms the world's most notorious drug trafficker was last seen in this area 30 minutes ago. Surveillance teams are on high alert.
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 border-t border-panel-border pt-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>06/22</span>
                <span>06/23</span>
                <span>06/24</span>
                <span>06/25</span>
                <span>06/26</span>
                <span>06/27</span>
                <span>06/28</span>
                <span>06/29</span>
              </div>
              <div className="mt-2 h-8 border border-panel-border bg-secondary/20"></div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Operations List */}
        <div className="col-span-3">
          <Card className="border-panel-border bg-card/50 p-4">
            <div className="mb-4 flex items-center justify-between border-b border-panel-border pb-2">
              <h3 className="text-foreground">Operations List</h3>
              <Badge variant="destructive" className="bg-terminal-red/20 text-terminal-red">20</Badge>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              updated in the previous 24 hours
            </p>

            <div className="space-y-3">
              {[
                { code: "@emgo", mission: "Track high-value target in Eastern Europe" },
                { code: "nRva", mission: "Infiltrate cybercrime network on Seoul" },
                { code: "Silentfire", mission: "Intercept illegal arms trade in Libya" },
                { code: "@emgo", mission: "Track high-value target in Eastern Europe" },
                { code: "gh@online", mission: "Monitor rogue agent communications in Berlin" },
                { code: "ii0m4lng", mission: "Support covert extraction in South America" },
                { code: "ii0m4lng", mission: "Support covert extraction in South America" }
              ].map((op, i) => (
                <div key={i} className="border border-panel-border bg-secondary/20 p-2">
                  <div className="text-xs">
                    <div className="text-foreground">Mission Code: {op.code}</div>
                    <div className="mt-1 text-foreground">{op.mission}</div>
                    <div className="mt-2 flex gap-2">
                      <button className="bg-secondary px-2 py-1 text-xs">Details</button>
                      <button className="bg-primary px-2 py-1 text-xs text-primary-foreground">Join Mission →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpyDashboard;