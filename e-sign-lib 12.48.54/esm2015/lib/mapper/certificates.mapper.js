export class CertificatesMapper {
    static map(src) {
        if (!src) {
            return null;
        }
        const { issuerName, name, thumbprint, validFrom, validTo } = src;
        const matches = issuerName.match(/CN=([^,+]*)/);
        const normalizedName = (matches && matches.length > 0)
            ? matches[1]
            : issuerName;
        return {
            issuerName: normalizedName,
            isValid: true,
            name,
            thumbprint,
            validFrom,
            validTo
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydGlmaWNhdGVzLm1hcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Utc2lnbi1saWIvc3JjL2xpYi9tYXBwZXIvY2VydGlmaWNhdGVzLm1hcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxNQUFNLE9BQU8sa0JBQWtCO0lBRTdCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBZ0I7UUFDekIsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1NBQUU7UUFDMUIsTUFBTSxFQUNKLFVBQVUsRUFDVixJQUFJLEVBQ0osVUFBVSxFQUNWLFNBQVMsRUFDVCxPQUFPLEVBQ1IsR0FBRyxHQUFHLENBQUM7UUFFUixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sY0FBYyxHQUFHLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBQ3BELENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1osQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUVmLE9BQU87WUFDTCxVQUFVLEVBQUUsY0FBYztZQUMxQixPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUk7WUFDSixVQUFVO1lBQ1YsU0FBUztZQUNULE9BQU87U0FDUixDQUFDO0lBQ0osQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2VydGlmaWNhdGUgfSBmcm9tICdAZXBzci9jcnlwdG8tcHJvJztcbmltcG9ydCB7Q2VydGlmaWNhdGVNb2RlbH0gZnJvbSBcIi4uL21vZGVsc1wiO1xuXG5leHBvcnQgY2xhc3MgQ2VydGlmaWNhdGVzTWFwcGVyIHtcblxuICBzdGF0aWMgbWFwKHNyYzogQ2VydGlmaWNhdGUpOiBDZXJ0aWZpY2F0ZU1vZGVsIHtcbiAgICBpZiAoIXNyYykgeyByZXR1cm4gbnVsbDsgfVxuICAgIGNvbnN0IHtcbiAgICAgIGlzc3Vlck5hbWUsXG4gICAgICBuYW1lLFxuICAgICAgdGh1bWJwcmludCxcbiAgICAgIHZhbGlkRnJvbSxcbiAgICAgIHZhbGlkVG9cbiAgICB9ID0gc3JjO1xuXG4gICAgY29uc3QgbWF0Y2hlcyA9IGlzc3Vlck5hbWUubWF0Y2goL0NOPShbXiwrXSopLyk7XG4gICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSAobWF0Y2hlcyAmJiBtYXRjaGVzLmxlbmd0aCA+IDApXG4gICAgICA/IG1hdGNoZXNbMV1cbiAgICAgIDogaXNzdWVyTmFtZTtcblxuICAgIHJldHVybiB7XG4gICAgICBpc3N1ZXJOYW1lOiBub3JtYWxpemVkTmFtZSxcbiAgICAgIGlzVmFsaWQ6IHRydWUsXG4gICAgICBuYW1lLFxuICAgICAgdGh1bWJwcmludCxcbiAgICAgIHZhbGlkRnJvbSxcbiAgICAgIHZhbGlkVG9cbiAgICB9O1xuICB9XG59XG4iXX0=