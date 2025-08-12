
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TeamMemberReport {
  user_id: string;
  name: string;
  email: string;
  total_productive_hours: number;
  total_unproductive_hours: number;
  total_active_hours: number;
  productivity_percentage: number;
  date: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Starting daily report generation and email sending...");

    // Generate daily summaries for all users
    const { error: summaryError } = await supabase.rpc('generate_daily_summary');
    if (summaryError) {
      console.error("Error generating daily summaries:", summaryError);
      throw summaryError;
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Fetch all daily reports for today with user details
    const { data: reports, error: reportsError } = await supabase
      .from('daily_reports')
      .select(`
        *,
        profiles!daily_reports_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq('date', today)
      .eq('report_sent', false);

    if (reportsError) {
      console.error("Error fetching reports:", reportsError);
      throw reportsError;
    }

    if (!reports || reports.length === 0) {
      console.log("No reports to send for today");
      return new Response(JSON.stringify({ message: "No reports to send" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get admin emails
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'admin');

    if (adminError) {
      console.error("Error fetching admins:", adminError);
      throw adminError;
    }

    const adminEmails = admins?.map(admin => admin.email) || [];
    
    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(JSON.stringify({ message: "No admin emails found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Format report data
    const teamReports: TeamMemberReport[] = reports.map(report => ({
      user_id: report.user_id,
      name: report.profiles?.full_name || 'Unknown User',
      email: report.profiles?.email || 'Unknown Email',
      total_productive_hours: report.total_productive_hours,
      total_unproductive_hours: report.total_unproductive_hours,
      total_active_hours: report.total_active_hours,
      productivity_percentage: report.productivity_percentage,
      date: report.date
    }));

    // Calculate team totals
    const teamTotals = teamReports.reduce((acc, report) => ({
      productive: acc.productive + report.total_productive_hours,
      unproductive: acc.unproductive + report.total_unproductive_hours,
      active: acc.active + report.total_active_hours,
    }), { productive: 0, unproductive: 0, active: 0 });

    const avgProductivity = teamReports.length > 0 
      ? Math.round(teamReports.reduce((sum, r) => sum + r.productivity_percentage, 0) / teamReports.length)
      : 0;

    // Create HTML email content
    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .summary { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat-card { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #1e40af; flex: 1; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8fafc; font-weight: bold; }
            .productive { color: #16a34a; font-weight: bold; }
            .unproductive { color: #dc2626; font-weight: bold; }
            .productivity-high { color: #16a34a; }
            .productivity-medium { color: #ca8a04; }
            .productivity-low { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Daily Team Productivity Report</h1>
            <p>Date: ${new Date(today).toLocaleDateString()}</p>
          </div>
          
          <div class="content">
            <div class="summary">
              <h2>Team Summary</h2>
              <div class="stats">
                <div class="stat-card">
                  <h3>Total Team Members</h3>
                  <p style="font-size: 24px; margin: 0;">${teamReports.length}</p>
                </div>
                <div class="stat-card">
                  <h3>Total Productive Hours</h3>
                  <p style="font-size: 24px; margin: 0; color: #16a34a;">${teamTotals.productive.toFixed(1)}h</p>
                </div>
                <div class="stat-card">
                  <h3>Total Active Hours</h3>
                  <p style="font-size: 24px; margin: 0;">${teamTotals.active.toFixed(1)}h</p>
                </div>
                <div class="stat-card">
                  <h3>Average Productivity</h3>
                  <p style="font-size: 24px; margin: 0;">${avgProductivity}%</p>
                </div>
              </div>
            </div>

            <h2>Individual Reports</h2>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Productive Hours</th>
                  <th>Unproductive Hours</th>
                  <th>Total Active</th>
                  <th>Productivity %</th>
                </tr>
              </thead>
              <tbody>
                ${teamReports.map(report => `
                  <tr>
                    <td>${report.name}</td>
                    <td>${report.email}</td>
                    <td class="productive">${report.total_productive_hours.toFixed(1)}h</td>
                    <td class="unproductive">${report.total_unproductive_hours.toFixed(1)}h</td>
                    <td>${report.total_active_hours.toFixed(1)}h</td>
                    <td class="${report.productivity_percentage >= 75 ? 'productivity-high' : 
                                report.productivity_percentage >= 50 ? 'productivity-medium' : 'productivity-low'}">${report.productivity_percentage}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="margin-top: 30px; padding: 20px; background-color: #f1f5f9; border-radius: 8px;">
              <h3>Report Notes:</h3>
              <ul>
                <li>This report covers all tracked activities for ${new Date(today).toLocaleDateString()}</li>
                <li>Productive hours include active work time</li>
                <li>Unproductive hours include breaks, idle time, and non-work activities</li>
                <li>Productivity percentage = (Productive Hours / Total Active Hours) × 100</li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to all admins
    const emailResponse = await resend.emails.send({
      from: "Employee Monitoring <reports@resend.dev>",
      to: adminEmails,
      subject: `Daily Team Productivity Report - ${new Date(today).toLocaleDateString()}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    // Mark reports as sent
    const { error: updateError } = await supabase
      .from('daily_reports')
      .update({ report_sent: true })
      .eq('date', today);

    if (updateError) {
      console.error("Error updating report status:", updateError);
    }

    return new Response(JSON.stringify({ 
      message: "Daily reports sent successfully",
      emailResponse,
      reportCount: reports.length,
      adminCount: adminEmails.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-daily-reports function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
